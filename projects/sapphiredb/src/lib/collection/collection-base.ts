import {BehaviorSubject, EMPTY, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, filter, finalize, map, publishReplay, refCount, share, switchMap, take, tap} from 'rxjs/operators';
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
import {DecoratorHelper} from '../helper/decorator-helper';
import {CommandBase} from '../command/command-base';

export abstract class CollectionBase<T, Y> {
  public prefilters: IPrefilter<any, any>[] = [];
  private serverState: Y;
  private tempChangesStorage$ = new BehaviorSubject<CollectionCommandBase[]>([]);

  private collectionObservable$: Observable<Y>;

  protected primaryKeys: string[] = [ 'id' ];

  constructor(protected collectionName: string,
              protected connectionManagerService: ConnectionManager,
              protected collectionManagerService: CollectionManager,
              protected classType: ClassType<T>,
              protected classTransformer: SapphireClassTransformer,
              protected offlineManager: OfflineManager,
              private enableLocalChangePreview: boolean,
              private createSubscribeCommand: () => CommandBase = () => new SubscribeCommand(this.collectionName, this.prefilters),
              private createQueryCommand: () => CommandBase = () => new QueryCommand(this.collectionName, this.prefilters)) {

    if (!!classType) {
      const primaryKeys = DecoratorHelper.getPrimaryKeys(this.classType);

      if (primaryKeys.length === 0) {
        throw Error('No primary keys for model were found');
      }

      this.primaryKeys = primaryKeys;
    }
  }

  /**
   * Get a snapshot of the values of the collection
   */
  public snapshot(): Observable<Y> {
    const queryCommand = this.createQueryCommand();
    let startWithValue$: Observable<any> = EMPTY;

    if (!!this.offlineManager) {
      startWithValue$ = this.offlineManager.getState(this.collectionName, this.prefilters);
    }

    return <Observable<Y>>this.connectionManagerService.sendCommand(queryCommand).pipe(
      map((response: QueryResponse) => response.result),
      tap((state) => {
        if (!!this.offlineManager) {
          this.serverState = <Y><any>state;
          this.offlineManager.setState(this.collectionName, this.prefilters, state);
        }
      }),
      RxjsHelper.startWithObservable(startWithValue$),
      switchMap((state) => {
        if (!this.offlineManager) {
          return of(state);
        }

        return this.offlineManager.getInterpolatedCollectionValue(this.collectionName, this.prefilters, state, this.primaryKeys);
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
    if (!this.collectionObservable$) {
      const collectionValue = this.createValuesSubscription();

      this.collectionObservable$ = this.createCollectionObservable$(collectionValue);
    }

    return this.collectionObservable$;
  }

  /**
   * Get all changes of a collection
   */
  public changes(): Observable<QueryResponse | ChangeResponse | ChangesResponse> {
    const subscribeCommand = this.createSubscribeCommand();

    return this.connectionManagerService.sendCommand(subscribeCommand, true)
      .pipe(
        map((response) => <QueryResponse | ChangeResponse | ChangesResponse>response),
        finalize(() => {
          this.connectionManagerService.sendCommand(
            new UnsubscribeCommand(subscribeCommand.referenceId), false, true);
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

    const command = new CreateRangeCommand(this.collectionName, values);

    if (this.enableLocalChangePreview) {
      this.addToTempChangesStorage(command);
    }

    const subject = new ReplaySubject<CreateRangeResponse|OfflineResponse>();
    const result = this.offlineManager ? this.offlineManager.sendCommand(command, this.primaryKeys) :
      <any>this.connectionManagerService.sendCommand(command);

    result.subscribe((response) => {
      subject.next(response);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    }, (error) => {
      subject.error(error);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    });

    return subject.pipe(take(1));
  }

  /**
   * Update a value of the collection
   * @param values The object(s) to update in the collection
   */
  public update(...values: [Partial<T>, Partial<T>][]): Observable<UpdateRangeResponse|OfflineResponse> {

    if (this.classType && this.classTransformer) {
      values = values.map(([value, newValueProperties]) => [
        this.classTransformer.classToPlain(value),
        this.classTransformer.classToPlain(newValueProperties)
      ]);
    }

    const command: UpdateRangeCommand = new UpdateRangeCommand(this.collectionName,
      values.map(([value, newValueProperties]) => new UpdateEntry(value, newValueProperties)));

    if (this.enableLocalChangePreview) {
      this.addToTempChangesStorage(command);
    }

    const result: Observable<UpdateRangeResponse|OfflineResponse> = this.offlineManager ?
      this.offlineManager.sendCommand(command, this.primaryKeys) :
      <any>this.connectionManagerService.sendCommand(command);

    const subject = new ReplaySubject<UpdateRangeResponse|OfflineResponse>();

    result.subscribe((response) => {
      subject.next(response);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    }, (error) => {
      subject.error(error);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    });

    return subject.pipe(take(1));
  }

  /**
   * Remove a value from the collection
   * @param values The object(s) to remove from the collection
   */
  public remove(...values: Partial<T>[]): Observable<DeleteRangeResponse|OfflineResponse> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    const subject = new Subject<DeleteRangeResponse|OfflineResponse>();

    const primaryKeyList = values.map((value) => {
      const primaryValues = {};
      this.primaryKeys.forEach(pk => {
        primaryValues[pk] = value[pk];
      });
      primaryValues['modifiedOn'] = value['modifiedOn'];
      return primaryValues;
    });

    const command: DeleteRangeCommand = new DeleteRangeCommand(this.collectionName, primaryKeyList);

    if (this.enableLocalChangePreview) {
      this.addToTempChangesStorage(command);
    }

    const result$ = this.offlineManager ? this.offlineManager.sendCommand(command, this.primaryKeys) :
      <any>this.connectionManagerService.sendCommand(command);

    result$.pipe(
      take(1)
    ).subscribe((response: DeleteRangeResponse|OfflineResponse) => {
      subject.next(response);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    }, (error) => {
      subject.error(error);
      subject.complete();

      if (this.enableLocalChangePreview) {
        this.removeFromTempChangesStorage(command.referenceId);
      }
    });

    return subject;
  }

  private createValuesSubscription(): CollectionValue<Y> {
    const subscribeCommand = this.createSubscribeCommand();
    const collectionValue = new CollectionValue<Y>(subscribeCommand.referenceId);

    const wsSubscription = this.connectionManagerService.sendCommand(subscribeCommand, true)
      .subscribe((response: (QueryResponse | ChangeResponse | ChangesResponse)) => {
        if (response.responseType === 'QueryResponse') {
          collectionValue.subject.next({
            values: (<QueryResponse>response).result,
            connectionId: this.connectionManagerService.getConnectionId()
          });
        } else if (response.responseType === 'ChangeResponse' || response.responseType === 'ChangesResponse') {
          collectionValue.subject.pipe(
            filter((values: CollectionValueContainer<Y>) =>
              !!values && values.connectionId === this.connectionManagerService.getConnectionId()),
            take(1)
          ).subscribe((container: CollectionValueContainer<Y>) => {
            if (response.responseType === 'ChangeResponse') {
              CollectionHelper.updateCollection<Y>(this.primaryKeys, container.values, <ChangeResponse>response);
            } else {
              (<ChangesResponse>response).changes.forEach(change => {
                CollectionHelper.updateCollection<Y>(this.primaryKeys, container.values, change);
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

  private createCollectionObservable$(collectionValue: CollectionValue<Y>): Observable<Y> {
    let startWithValue$: Observable<any> = EMPTY;

    if (!!this.offlineManager) {
      startWithValue$ = this.offlineManager.getState(this.collectionName, this.prefilters);
    }

    return <Observable<any>>collectionValue.subject.pipe(
      map((container) => container.values),
      tap((state) => {
        if (!!this.offlineManager) {
          this.serverState = <Y><any>state;
          this.offlineManager.setState(this.collectionName, this.prefilters, state);
        }
      }),
      RxjsHelper.startWithObservable(startWithValue$),
      finalize(() => {
        this.connectionManagerService.sendCommand(new UnsubscribeCommand(collectionValue.referenceId), false, true);
        collectionValue.socketSubscription.unsubscribe();
        this.collectionObservable$ = undefined;
      }),
      switchMap((state) => {
        if (!this.offlineManager) {
          return of(state);
        }

        return this.offlineManager.getInterpolatedCollectionValue(this.collectionName, this.prefilters, state, this.primaryKeys);
      }),
      switchMap((state) => {
        return this.tempChangesStorage$.pipe(
          map((changes) => {
            if (CollectionHelper.hasAfterQueryPrefilter(this.prefilters)) {
              return state;
            }

            return CollectionHelper.getInterpolatedCollectionValue(changes, state, this.primaryKeys);
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
