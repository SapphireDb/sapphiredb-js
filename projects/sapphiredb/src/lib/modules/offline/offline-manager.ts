import {SapphireStorage} from '../../helper/sapphire-storage';
import {IPrefilter} from '../../collection/prefilter/iprefilter';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from 'rxjs';
import {CollectionHelper} from '../../helper/collection-helper';
import {filter, map, skip, switchMap, take} from 'rxjs/operators';
import {InfoResponse} from '../../command/info/info-response';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {ConnectionManager} from '../../connection/connection-manager';
import {ValidatedResponseBase} from '../../command/validated-response-base';
import {ConnectionState} from '../../models/types';
import {ExecuteCommandsCommand} from '../../command/execute-commands/execute-commands-command';
import {ExecuteCommandsResponse} from '../../command/execute-commands/execute-commands-response';
import {OfflineCommandHelper} from '../../helper/offline-command-helper';

const CollectionStoragePrefix = 'sapphiredb.collection.';
const CollectionInformationStoragePrefix = 'sapphiredb.collectioninformation.';
const CollectionChangeStorage = 'sapphiredb.collectionchanges';

export class OfflineManager {
  private disableUpdate = false;
  private changeStorage$: BehaviorSubject<{ [collectionKey: string]: CollectionCommandBase[] }> =
    new BehaviorSubject<{ [p: string]: CollectionCommandBase[] }>({});

  public offlineTransferResults$ = new ReplaySubject<ExecuteCommandsResponse>();

  constructor(private storage: SapphireStorage, private connectionManager: ConnectionManager) {
    this.changeStorage$.pipe(skip(2)).subscribe((changes) => {
      this.storage.set(CollectionChangeStorage, JSON.stringify(changes));
    });

    combineLatest([this.connectionManager.connection.connectionInformation$, this.changeStorage$])
      .pipe(
        filter(([information]) => !this.disableUpdate && information.readyState === ConnectionState.connected),
        switchMap(([, changeStorage]) => {
          const allChanges: CollectionCommandBase[] = Object.keys(changeStorage)
            .map(key => changeStorage[key])
            .reduce((a, b) => a.concat(b), []);

          if (allChanges.length === 0) {
            return of(null);
          }

          return this.connectionManager.sendCommand(new ExecuteCommandsCommand(allChanges));
        })
      ).subscribe((response: ExecuteCommandsResponse|null) => {
        this.disableUpdate = true;
        this.changeStorage$.next({});
        this.disableUpdate = false;
        this.offlineTransferResults$.next(response);
      });

    this.storage.get(CollectionChangeStorage).subscribe((changeStorage) => {
      if (!!changeStorage) {
        this.changeStorage$.next(JSON.parse(changeStorage));
      }
    });
  }

  getCollectionInformation(contextName: string, collectionName: string): Observable<InfoResponse> {
    const offlineKey = `${CollectionInformationStoragePrefix}${contextName}.${collectionName}`;
    return this.storage.get(offlineKey).pipe(
      map(v => JSON.parse(v))
    );
  }

  setCollectionInformation(contextName: string, collectionName: string, collectionInformation: InfoResponse) {
    const offlineKey = `${CollectionInformationStoragePrefix}${contextName}.${collectionName}`;
    this.storage.set(offlineKey, JSON.stringify(collectionInformation));
  }

  getState(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[]): Observable<any> {
    const offlineKey = `${CollectionStoragePrefix}${contextName}.${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.get(offlineKey).pipe(
      map(v => {
        const result = JSON.parse(v);
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

  setState(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[], state: any) {
    const offlineKey = `${CollectionStoragePrefix}${contextName}.${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.set(offlineKey, JSON.stringify(state));
  }

  sendCommand(command: CollectionCommandBase, info$: Observable<InfoResponse>): Observable<any> {
    const connectionState: ConnectionState = this.connectionManager.connection.connectionInformation$.value.readyState;

    if (connectionState === ConnectionState.connected) {
      return <Observable<ValidatedResponseBase>>this.connectionManager.sendCommand(command);
    }

    const collectionKey = `${command.contextName}.${command.collectionName}`;
    const changeStorageValue = this.changeStorage$.value;

    if (!changeStorageValue[collectionKey]) {
      changeStorageValue[collectionKey] = [];
    }

    const collectionChanges = changeStorageValue[collectionKey];

    info$.pipe(
      take(1)
    ).subscribe((info: InfoResponse) => {
      if (OfflineCommandHelper.handleAddCommand(command, info, collectionChanges)) {
        collectionChanges.push(command);
      }

      this.changeStorage$.next(changeStorageValue);
    });

    return of(null);
  }

  getInterpolatedCollectionValue(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[], state: any[],
                                 info$: Observable<InfoResponse>): Observable<any> {
    const collectionKey = `${contextName}.${collectionName}`;

    return this.changeStorage$.pipe(
      switchMap((changeStorage) => {
        if (CollectionHelper.hasAfterQueryPrefilter(prefilters)) {
          return of(state);
        }

        const collectionChanges = changeStorage[collectionKey];

        return CollectionHelper.getInterpolatedCollectionValue(collectionChanges, state, info$);
      }),
    );
  }

  reset() {
    this.disableUpdate = true;
    this.changeStorage$.next({});
    this.disableUpdate = false;
  }
}

