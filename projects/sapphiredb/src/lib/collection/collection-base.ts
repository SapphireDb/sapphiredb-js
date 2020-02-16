import {Observable, Subject} from 'rxjs';
import {CreateCommand} from '../command/create/create-command';
import {CreateResponse} from '../command/create/create-response';
import {CommandResult} from '../models/command-result';
import {DeleteResponse} from '../command/delete/delete-response';
import {UpdateCommand} from '../command/update/update-command';
import {UpdateResponse} from '../command/update/update-response';
import {DeleteCommand} from '../command/delete/delete-command';
import {finalize, map, publishReplay, refCount, share, switchMap, take} from 'rxjs/operators';
import {InfoResponse} from '../command/info/info-response';
import {QueryCommand} from '../command/query/query-command';
import {QueryResponse} from '../command/query/query-response';
import {CollectionValue} from './collection-value';
import {IPrefilter} from './prefilter/iprefilter';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {CollectionManager} from './collection-manager';
import {CollectionHelper} from '../helper/collection-helper';
import {ConnectionManager} from '../connection/connection-manager';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {ChangeResponse, ChangesResponse} from '../command/subscribe/change-response';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {UpdateRangeCommand} from '../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../command/delete-range/delete-range-command';
import {ClassType} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';

export class CollectionBase<T, Y> {
  public prefilters: IPrefilter<any, any>[] = [];
  public collectionName: string;
  public contextName: string;

  constructor(collectionNameRaw: string,
              protected connectionManagerService: ConnectionManager,
              protected collectionInformation: Observable<InfoResponse>,
              protected collectionManagerService: CollectionManager,
              protected classType: ClassType<T>,
              protected classTransformer: SapphireClassTransformer) {
    const collectionNameParts: string[] = collectionNameRaw.split('.');

    this.collectionName = collectionNameParts.length === 1 ? collectionNameParts[0] : collectionNameParts[1];
    this.contextName = collectionNameParts.length === 2 ? collectionNameParts[0] : 'default';
  }

  /**
   * Get a snapshot of the values of the collection
   */
  public snapshot(): Observable<Y> {
    const queryCommand = new QueryCommand(this.collectionName, this.contextName, this.prefilters);

    return <Observable<Y>>this.connectionManagerService.sendCommand(queryCommand).pipe(
      map((response: QueryResponse) => {
        if (this.classType && this.classTransformer) {
          return <Y><any>this.classTransformer.plainToClass(response.result, this.classType);
        }

        return response.result;
      })
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
  public add(...values: T[]): Observable<CommandResult<T>> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    if (values.length === 1) {
      return this.createCommandResult$(
        <any>this.connectionManagerService.sendCommand(new CreateCommand(this.collectionName, this.contextName, values[0])));
    } else {
      return this.createCommandResult$(
        <any>this.connectionManagerService.sendCommand(new CreateRangeCommand(this.collectionName, this.contextName, values)));
    }
  }

  /**
   * Update a value of the collection
   * @param values The object(s) to update in the collection
   */
  public update(...values: T[]): Observable<CommandResult<T>> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    if (values.length === 1) {
      return this.createCommandResult$(
        <any>this.connectionManagerService.sendCommand(new UpdateCommand(this.collectionName, this.contextName, values[0])));
    } else {
      return this.createCommandResult$(
        <any>this.connectionManagerService.sendCommand(new UpdateRangeCommand(this.collectionName, this.contextName, values)));
    }
  }

  /**
   * Remove a value from the collection
   * @param values The object(s) to remove from the collection
   */
  public remove(...values: T[]): Observable<CommandResult<T>> {
    if (this.classType && this.classTransformer) {
      values = this.classTransformer.classToPlain(values);
    }

    const subject = new Subject<CommandResult<T>>();

    this.collectionInformation.pipe(
      switchMap((info: InfoResponse) => {
        const primaryKeyList = values.map((value) => {
          const primaryValues = {};
          info.primaryKeys.forEach(pk => {
            primaryValues[pk] = value[pk];
          });
          return primaryValues;
        });

        let deleteCommand;

        if (primaryKeyList.length === 1) {
          deleteCommand = new DeleteCommand(this.collectionName, this.contextName, primaryKeyList[0]);
        } else {
          deleteCommand = new DeleteRangeCommand(this.collectionName, this.contextName, primaryKeyList);
        }

        return this.connectionManagerService.sendCommand(deleteCommand).pipe(map((response: DeleteResponse) => {
          return new CommandResult<T>(response.error, response.validationResults);
        }));
      }),
      take(1)
    ).subscribe((response) => {
      subject.next(response);
    });

    return subject;
  }

  private createCommandResult$(observable$: Observable<CreateResponse|UpdateResponse>): Observable<CommandResult<T>> {
    // TODO: Handle update/create-Range response
    return observable$.pipe(map((response: CreateResponse|UpdateResponse) => {
      return new CommandResult<T>(response.error, response.validationResults,
        response.responseType === 'CreateResponse' ?
          (<CreateResponse>response).newObject : (<UpdateResponse>response).updatedObject);
    }));
  }

  private createValuesSubscription(collectionName: string, contextName: string, collectionInformation: Observable<InfoResponse>,
                                   prefilters: IPrefilter<any, any>[]): CollectionValue<T> {
    const subscribeCommand = new SubscribeCommand(collectionName, contextName, prefilters);
    const collectionValue = new CollectionValue<T>(subscribeCommand.referenceId);

    const wsSubscription = this.connectionManagerService.sendCommand(subscribeCommand, true)
      .subscribe((response: (QueryResponse | ChangeResponse | ChangesResponse)) => {
        if (response.responseType === 'QueryResponse') {
          collectionValue.subject.next((<QueryResponse>response).result);
        } else if (response.responseType === 'ChangeResponse') {
          CollectionHelper.updateCollection<T>(collectionValue.subject, collectionInformation, <ChangeResponse>response);
        } else if (response.responseType === 'ChangesResponse') {
          (<ChangesResponse>response).changes.forEach(change => {
            CollectionHelper.updateCollection<T>(collectionValue.subject, collectionInformation, change);
          });
        }
      }, (error) => {
        collectionValue.subject.error(error);
      });

    collectionValue.setSubscription(wsSubscription);

    return collectionValue;
  }

  private createCollectionObservable$(collectionValue: CollectionValue<any>): Observable<Y> {
    return <Observable<any>>collectionValue.subject.pipe(
      finalize(() => {
        this.connectionManagerService.sendCommand(
          new UnsubscribeCommand(this.collectionName, this.contextName, collectionValue.referenceId), false, true);
        collectionValue.socketSubscription.unsubscribe();
      }),
      map((array: T[]) => {
        for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(this.prefilters)) {
          array = prefilter.execute(array);
        }

        if (this.classType && this.classTransformer) {
          return <Y><any>this.classTransformer.plainToClass(array, this.classType);
        }

        return array;
      }),
      publishReplay(1),
      refCount()
    );
  }
}
