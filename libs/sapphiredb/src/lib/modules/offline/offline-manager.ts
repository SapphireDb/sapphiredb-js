import {SapphireNoopStorage, SapphireStorage} from '../../helper/sapphire-storage';
import {IPrefilter} from '../../collection/prefilter/iprefilter';
import {BehaviorSubject, combineLatest, filter, map, Observable, of, ReplaySubject, skip, switchMap} from 'rxjs';
import {CollectionHelper} from '../../helper/collection-helper';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {ConnectionManager} from '../../connection/connection-manager';
import {ValidatedResponseBase} from '../../command/validated-response-base';
import {ConnectionState} from '../../models/types';
import {ExecuteCommandsCommand} from '../../command/execute-commands/execute-commands-command';
import {ExecuteCommandsResponse} from '../../command/execute-commands/execute-commands-response';
import {OfflineResponse} from './offline-response';
import {CreateRangeCommand} from '../../command/create-range/create-range-command';
import {UpdateRangeCommand} from '../../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../../command/delete-range/delete-range-command';
import {OfflineHelper} from './offline-helper';
import {ResponseBase} from '../../command/response-base';

const CollectionStoragePrefix = 'sapphiredb.collection.';
const CollectionChangeStorage = 'sapphiredb.collectionchanges';

export class OfflineManager {
  private disableUpdate = false;
  private changeStorage$: BehaviorSubject<{ [collectionKey: string]: CollectionCommandBase[] }> =
    new BehaviorSubject<{ [p: string]: CollectionCommandBase[] }>({});

  // TODO: check if bufferSize should be 1
  public offlineTransferResults$ = new ReplaySubject<ExecuteCommandsResponse|undefined>();

  constructor(private storage: SapphireStorage, private connectionManager: ConnectionManager) {
    if (!this.storage) {
      console.warn('No storage was configured. Using SapphireNoopStorage and will not store things locally.');
      this.storage = new SapphireNoopStorage();
    }

    this.changeStorage$.pipe(skip(1)).subscribe((changes) => {
      this.storage.set(CollectionChangeStorage, JSON.stringify(changes));
    });

    // TODO: use correct data from connection manager
    combineLatest([/*this.connectionManager.connection.connectionInformation$*/of({ connectionId: '',readyState: ConnectionState.connected }), this.changeStorage$])
      .pipe(
        filter(([information]) => !this.disableUpdate && information.readyState === ConnectionState.connected),
        switchMap(([, changeStorage]) => {
          const allChanges: CollectionCommandBase[] = Object.keys(changeStorage)
            .map(key => changeStorage[key])
            .reduce((a, b) => a.concat(b), []);

          if (allChanges.length === 0) {
            return of(null);
          }

          return this.connectionManager.sendCommand<ExecuteCommandsResponse>(new ExecuteCommandsCommand(allChanges));
        })
      ).subscribe((response: ExecuteCommandsResponse|null) => {
        this.disableUpdate = true;
        this.changeStorage$.next({});
        this.disableUpdate = false;
        this.offlineTransferResults$.next(response as ExecuteCommandsResponse);
      });

    this.storage.get(CollectionChangeStorage).subscribe((changeStorage) => {
      if (!!changeStorage) {
        this.changeStorage$.next(JSON.parse(changeStorage));
      }
    });
  }

  getState(collectionName: string, prefilters: IPrefilter<any, any>[]): Observable<any> {
    const offlineKey = `${CollectionStoragePrefix}${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.get(offlineKey).pipe(
      map(v => {
        const result = !!v ? JSON.parse(v) : null;
        if (!!result) {
          return result;
        }

        if (!CollectionHelper.hasAfterQueryPrefilter(prefilters)) {
          return [];
        }

        return null;
      })
    );
  }

  setState(collectionName: string, prefilters: IPrefilter<any, any>[], state: any) {
    const offlineKey = `${CollectionStoragePrefix}${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.set(offlineKey, JSON.stringify(state));
  }

  sendCommand<TResponse extends ResponseBase, TOfflineResponse extends OfflineResponse>(command: CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand, primaryKeys: string[]): Observable<TResponse|TOfflineResponse> {
    // TODO: use real connection state
    // const connectionState: ConnectionState = this.connectionManager.connection.connectionInformation$.value.readyState;
    const connectionState: ConnectionState = ConnectionState.connected;

    if (connectionState === ConnectionState.connected) {
      return <Observable<TResponse>>this.connectionManager.sendCommand<TResponse>(command);
    }

    const changeStorageValue = this.changeStorage$.value;

    if (!changeStorageValue[command.collectionName]) {
      changeStorageValue[command.collectionName] = [];
    }

    const collectionChanges = changeStorageValue[command.collectionName];

    if (OfflineHelper.handleAddCommand(command, primaryKeys, collectionChanges)) {
      collectionChanges.push(command);
    }

    this.changeStorage$.next(changeStorageValue);

    const results = command.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand>command).entries.map(e => e.value)
      : (<CreateRangeCommand|DeleteRangeCommand>command).values;

    return of({
      referenceId: command.referenceId,
      responseType: 'OfflineResponse',
      results: results
        .map((value) => (<ValidatedResponseBase>{ value: value })),
    } as unknown as TOfflineResponse);
  }

  getInterpolatedCollectionValue(collectionName: string, prefilters: IPrefilter<any, any>[], state: any[],
                                 primaryKeys: string[]): Observable<any> {
    return this.changeStorage$.pipe(
      map((changeStorage) => {
        if (CollectionHelper.hasAfterQueryPrefilter(prefilters)) {
          return state;
        }

        const collectionChanges = changeStorage[collectionName];

        return CollectionHelper.getInterpolatedCollectionValue(collectionChanges, state, primaryKeys);
      }),
    );
  }

  reset() {
    this.disableUpdate = true;
    this.changeStorage$.next({});
    this.disableUpdate = false;
  }
}

