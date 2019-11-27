import {Observable, pipe} from 'rxjs';
import {CreateCommand} from '../command/create/create-command';
import {CreateResponse} from '../command/create/create-response';
import {CommandResult} from '../models/command-result';
import {DeleteResponse} from '../command/delete/delete-response';
import {UpdateCommand} from '../command/update/update-command';
import {UpdateResponse} from '../command/update/update-response';
import {DeleteCommand} from '../command/delete/delete-command';
import {finalize, map, share, switchMap} from 'rxjs/operators';
import {InfoResponse} from '../command/info/info-response';
import {AuthCollectionInfo} from '../modules/auth/auth-collection-info';
import {QueryCommand} from '../command/query/query-command';
import {QueryResponse} from '../command/query/query-response';
import {CollectionValue} from './collection-value';
import {IPrefilter} from './prefilter/iprefilter';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {CollectionManagerService} from './services/collection-manager.service';
import {CollectionHelper} from '../helper/collection-helper';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {ChangeResponse} from '../command/subscribe/change-response';
import {UnloadResponse} from '../command/subscribe/unload-response';
import {LoadResponse} from '../command/subscribe/load-response';

export class CollectionBase<T, Y> {
  public prefilters: IPrefilter<any, any>[] = [];

  /**
   * Information about Authentication and Authorization of the collection
   */
  public authInfo: AuthCollectionInfo;

  constructor(public collectionName: string,
              public contextName: string,
              protected connectionManagerService: ConnectionManagerService,
              protected collectionInformation: Observable<InfoResponse>,
              protected collectionManagerService: CollectionManagerService) {
    this.authInfo = new AuthCollectionInfo(this.collectionInformation);
  }

  /**
   * Get a snapshot of the values of the collection
   */
  public snapshot(): Observable<Y> {
    const queryCommand = new QueryCommand(this.collectionName, this.contextName, this.prefilters);

    return <Observable<Y>>this.connectionManagerService.sendCommand(queryCommand).pipe(
      map((response: QueryResponse) => {
        const array = response.result;

        // for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(this.prefilters)) {
        //   array = prefilter.execute(array);
        // }

        return array;
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
   * Add a value to the collection
   * @param value The object to add to the collection
   */
  public add(value: T): Observable<CommandResult<T>> {
    return this.createCommandResult$(
      <any>this.connectionManagerService.sendCommand(new CreateCommand(this.collectionName, this.contextName, value)));
  }

  /**
   * Update a value of the collection
   * @param value The object to update in the collection
   */
  public update(value: T): Observable<CommandResult<T>> {
    return this.createCommandResult$(
      <any>this.connectionManagerService.sendCommand(new UpdateCommand(this.collectionName, this.contextName, value)));
  }

  /**
   * Remove a value from the collection
   * @param value The object to remove from the collection
   */
  public remove(value: T): Observable<CommandResult<T>> {
    return this.collectionInformation.pipe(
      switchMap((info: InfoResponse) => {
        const primaryValues = {};
        info.primaryKeys.forEach(pk => {
          primaryValues[pk] = value[pk];
        });

        const deleteCommand = new DeleteCommand(this.collectionName, this.contextName, primaryValues);
        return this.connectionManagerService.sendCommand(deleteCommand).pipe(map((response: DeleteResponse) => {
          return new CommandResult<T>(response.error, response.validationResults);
        }));
    }));
  }

  private createCommandResult$(observable$: Observable<CreateResponse|UpdateResponse>): Observable<CommandResult<T>> {
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
      .subscribe((response: (QueryResponse | ChangeResponse | UnloadResponse | LoadResponse)) => {
        if (response.responseType === 'QueryResponse') {
          collectionValue.subject.next((<QueryResponse>response).result);
        } else if (response.responseType === 'ChangeResponse') {
          CollectionHelper.updateCollection<T>(collectionValue.subject, collectionInformation, <ChangeResponse>response);
        } else if (response.responseType === 'UnloadResponse') {
          CollectionHelper.unloadItem<T>(collectionValue.subject, collectionInformation, <UnloadResponse>response);
        } else if (response.responseType === 'LoadResponse') {
          CollectionHelper.loadItem<T>(collectionValue.subject, <LoadResponse>response);
        }
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
        // for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(prefilters)) {
        //   array = prefilter.execute(array);
        // }

        return array;
      }),
      share()
    );
  }
}
