import {BehaviorSubject, combineLatest, EMPTY, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, filter, finalize, map, publishReplay, refCount, share, switchMap, take, tap} from 'rxjs/operators';
import {InfoResponse} from '../command/info/info-response';
import {QueryCommand} from '../command/query/query-command';
import {QueryResponse} from '../command/query/query-response';
import {CollectionValue, CollectionValueContainer} from './collection-value';
import {IPrefilter} from './prefilter/iprefilter';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {CollectionManager} from './collection-manager';
import {CollectionHelper} from '../helper/collection-helper';
import {ConnectionManager} from '../connection/connection-manager';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {ChangeResponse, ChangesResponse} from '../command/subscribe/change-response';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {UpdateEntry, UpdateRangeCommand} from '../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../command/delete-range/delete-range-command';
import {ClassType} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';
import {UpdateRangeResponse} from '../command/update-range/update-range-response';
import {CreateRangeResponse} from '../command/create-range/create-range-response';
import {DeleteRangeResponse} from '../command/delete-range/delete-range-response';
import {OfflineManager} from '../modules/offline/offline-manager';
import {RxjsHelper} from '../helper/rxjs-helper';
import {CollectionCommandBase} from '../command/collection-command-base';
import {OfflineResponse} from '../modules/offline/offline-response';
import {FilterFunctions} from '../helper/filter-functions';

export abstract class CollectionBase<T, Y> {
  public prefilters: IPrefilter<any, any>[] = [];
  public collectionName: string;
  public contextName: string;
  private serverState: Y;
  private tempChangesStorage$ = new BehaviorSubject<CollectionCommandBase[]>([]);

  constructor(collectionNameRaw: string,
              protected connectionManagerService: ConnectionManager,
              protected collectionInformation: Observable<InfoResponse>,
              protected collectionManagerService: CollectionManager,
              protected classType: ClassType<T>,
              protected classTransformer: SapphireClassTransformer,
              protected offlineManager: OfflineManager) {
    const collectionNameParts: string[] = collectionNameRaw.split('.');

    this.collectionName = collectionNameParts.length === 1 ? collectionNameParts[0] : collectionNameParts[1];
    this.contextName = collectionNameParts.length === 2 ? collectionNameParts[0] : 'default';
  }

  /**
   * Get a snapshot of the values of the collection
   */
  public snapshot(): Observable<Y> {
    const queryCommand = new QueryCommand(this.collectionName, this.contextName, this.prefilters);

    let startWithValue$: Observable<any> = EMPTY;

    if (!!this.offlineManager) {
      startWithValue$ = this.offlineManager.getState(this.contextName, this.collectionName, this.prefilters);
    }

    return <Observable<Y>>this.connectionManagerService.sendCommand(queryCommand).pipe(
      map((response: QueryResponse) => response.result),
      tap((state) => {
        if (!!this.offlineManager) {
          this.serverState = <Y><any>state;
          this.offlineManager.setState(this.contextName, this.collectionName, this.prefilters, state);
        }
      }),
      RxjsHelper.startWithObservable(startWithValue$),
      switchMap((state) => {
        if (!this.offlineManager) {
          return of(state);
        }

        return this.offlineManager.getInterpolatedCollectionValue(this.contextName, this.collectionName, this.prefilters, state,
          this.collectionInformation);
      }),
      map((result: Y) => {
        if (this.classType && this.classTransformer) {
          return <Y><any>this.classTransformer.plainToClass(result, this.classType);
        }

        return result;
      }),
      debounceTime(10)
    );
  }

  /**
   * Get the values of the collection and also get updates if the collection has changed
   */
  public values(): Observable<Y> {
    const collectionValue = this.createValuesSubscription(this.collectionName, this.contextName,
      this.collectionInformation, this.prefilters);
    return this.createCollectionObservable$(collectionValue);
  }

  /**
   * Get all changes of a collection
   */
  public changes(): Observable<QueryResponse | ChangeResponse | ChangesResponse> {
    const subscribeCommand = new SubscribeCommand(this.collectionName, this.contextName, this.prefilters);
    return this.connectionManagerService.sendCommand(subscribeCommand, true)
      .pipe(
        map((response) => <QueryResponse | ChangeResponse | ChangesResponse>response),
        finalize(() => {
          this.connectionManagerService.sendCommand(
            new UnsubscribeCommand(this.collectionName, this.contextName, subscribeCommand.referenceId), false, true);
        }),
        share()
      );
  }

  /**
   * Add a value to the collection
   * @param values The object(s) to add to the collection
   */
  public add(...values: T[]): Observable<CreateRangeResponse|OfflineResponse> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    const command = new CreateRangeCommand(this.collectionName, this.contextName, values);

    this.addToTempChangesStorage(command);
    const subject = new ReplaySubject<CreateRangeResponse|OfflineResponse>();
    const result = this.offlineManager ? this.offlineManager.sendCommand(command, this.collectionInformation) :
      <any>this.connectionManagerService.sendCommand(command);

    result.subscribe((response) => {
      subject.next(response);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    }, (error) => {
      subject.error(error);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    });

    return subject.pipe(take(1));
  }

  /**
   * Update a value of the collection
   * @param values The object(s) to update in the collection
   */
  public update(...values: T[]): Observable<UpdateRangeResponse|OfflineResponse> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    const subject = new ReplaySubject<UpdateRangeResponse|OfflineResponse>();

    let result: Observable<UpdateRangeResponse|OfflineResponse>;
    let command: UpdateRangeCommand;

    if (!CollectionHelper.hasAfterQueryPrefilter(this.prefilters)) {
      result = combineLatest([this.snapshot(), this.collectionInformation]).pipe(
        take(1),
        switchMap(([snapshot, info]: [any, InfoResponse]) => {
          command = new UpdateRangeCommand(this.collectionName, this.contextName, values.map(value => {
            const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, value);
            let previousValue = snapshot.find(v => filterFunction(v));

            if (this.classType && this.classTransformer) {
              previousValue = this.classTransformer.classToPlain(previousValue);
            }

            return new UpdateEntry(value, previousValue);
          }));
          this.addToTempChangesStorage(command);
          return <Observable<UpdateRangeResponse|OfflineResponse>>(this.offlineManager ?
            this.offlineManager.sendCommand(command, this.collectionInformation) :
            <any>this.connectionManagerService.sendCommand(command));
        })
      );
    } else {
      command = new UpdateRangeCommand(this.collectionName, this.contextName, values.map(v => new UpdateEntry(v)));
      this.addToTempChangesStorage(command);
      result = this.offlineManager ? this.offlineManager.sendCommand(command, this.collectionInformation) :
        <any>this.connectionManagerService.sendCommand(command);
    }

    result.subscribe((response) => {
      subject.next(response);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    }, (error) => {
      subject.error(error);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    });

    return subject.pipe(take(1));
  }

  /**
   * Remove a value from the collection
   * @param values The object(s) to remove from the collection
   */
  public remove(...values: T[]): Observable<DeleteRangeResponse|OfflineResponse> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    const subject = new Subject<DeleteRangeResponse|OfflineResponse>();

    let command: DeleteRangeCommand;

    this.collectionInformation.pipe(
      switchMap((info: InfoResponse) => {
        const primaryKeyList = values.map((value) => {
          const primaryValues = {};
          info.primaryKeys.forEach(pk => {
            primaryValues[pk] = value[pk];
          });
          primaryValues['modifiedOn'] = value['modifiedOn'];
          return primaryValues;
        });

        command = new DeleteRangeCommand(this.collectionName, this.contextName, primaryKeyList);

        this.addToTempChangesStorage(command);
        return this.offlineManager ? this.offlineManager.sendCommand(command, this.collectionInformation) :
          <any>this.connectionManagerService.sendCommand(command);
      }),
      take(1)
    ).subscribe((response: DeleteRangeResponse|OfflineResponse) => {
      subject.next(response);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    }, (error) => {
      subject.error(error);
      subject.complete();
      this.removeFromTempChangesStorage(command.referenceId);
    });

    return subject;
  }

  private createValuesSubscription(collectionName: string, contextName: string, collectionInformation: Observable<InfoResponse>,
                                   prefilters: IPrefilter<any, any>[]): CollectionValue<T> {
    const subscribeCommand = new SubscribeCommand(collectionName, contextName, prefilters);
    const collectionValue = new CollectionValue<T>(subscribeCommand.referenceId);

    const wsSubscription = this.connectionManagerService.sendCommand(subscribeCommand, true)
      .subscribe((response: (QueryResponse | ChangeResponse | ChangesResponse)) => {
        if (response.responseType === 'QueryResponse') {
          collectionValue.subject.next({
            values: (<QueryResponse>response).result,
            connectionId: this.connectionManagerService.getConnectionId()
          });
        } else if (response.responseType === 'ChangeResponse' || response.responseType === 'ChangesResponse') {
          collectionInformation.pipe(
            switchMap((info) => collectionValue.subject.pipe(map(values => [info, values]))),
            filter(([, values]: [null, CollectionValueContainer<T>]) =>
              !!values && values.connectionId === this.connectionManagerService.getConnectionId()),
            take(1)
          ).subscribe(([info, container]: [InfoResponse, CollectionValueContainer<T>]) => {
            if (response.responseType === 'ChangeResponse') {
              CollectionHelper.updateCollection<T>(info, container.values, <ChangeResponse>response);
            } else {
              (<ChangesResponse>response).changes.forEach(change => {
                CollectionHelper.updateCollection<T>(info, container.values, change);
              });
            }

            collectionValue.subject.next(container);
          });
        }
      }, (error) => {
        collectionValue.subject.error(error);
      });

    collectionValue.setSubscription(wsSubscription);

    return collectionValue;
  }

  private createCollectionObservable$(collectionValue: CollectionValue<any>): Observable<Y> {
    let startWithValue$: Observable<any> = EMPTY;

    if (!!this.offlineManager) {
      startWithValue$ = this.offlineManager.getState(this.contextName, this.collectionName, this.prefilters);
    }

    return <Observable<any>>collectionValue.subject.pipe(
      map((container) => container.values),
      tap((state) => {
        if (!!this.offlineManager) {
          this.serverState = <Y><any>state;
          this.offlineManager.setState(this.contextName, this.collectionName, this.prefilters, state);
        }
      }),
      RxjsHelper.startWithObservable(startWithValue$),
      finalize(() => {
        this.connectionManagerService.sendCommand(
          new UnsubscribeCommand(this.collectionName, this.contextName, collectionValue.referenceId), false, true);
        collectionValue.socketSubscription.unsubscribe();
      }),
      switchMap((state) => {
        if (!this.offlineManager) {
          return of(state);
        }

        return this.offlineManager.getInterpolatedCollectionValue(this.contextName, this.collectionName, this.prefilters,
          state, this.collectionInformation);
      }),
      switchMap((state) => {
        return this.tempChangesStorage$.pipe(
          switchMap((changes) => {
            if (CollectionHelper.hasAfterQueryPrefilter(this.prefilters)) {
              return of(state);
            }

            return CollectionHelper.getInterpolatedCollectionValue(changes, state, this.collectionInformation);
          })
        );
      }),
      map((array: T[]) => {
        if (!CollectionHelper.hasAfterQueryPrefilter(this.prefilters)) {
          for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(this.prefilters)) {
            array = prefilter.execute(array);
          }
        }

        if (this.classType && this.classTransformer) {
          return <Y><any>this.classTransformer.plainToClass(array, this.classType);
        }

        return array;
      }),
      debounceTime(10),
      publishReplay(1),
      refCount()
    );
  }

  private addToTempChangesStorage(command: CollectionCommandBase): void {
    const value = this.tempChangesStorage$.value;
    value.push(command);
    this.tempChangesStorage$.next(value);
  }

  private removeFromTempChangesStorage(referenceId: string): void {
    let value = this.tempChangesStorage$.value;
    value = value.filter(v => v.referenceId !== referenceId);
    this.tempChangesStorage$.next(value);
  }
}
