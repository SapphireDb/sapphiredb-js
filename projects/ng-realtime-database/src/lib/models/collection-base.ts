import {Observable, pipe} from 'rxjs';
import {CreateCommand} from './command/create-command';
import {CreateResponse} from './response/create-response';
import {CommandResult} from './command-result';
import {DeleteResponse} from './response/delete-response';
import {UpdateCommand} from './command/update-command';
import {UpdateResponse} from './response/update-response';
import {DeleteCommand} from './command/delete-command';
import {finalize, map, switchMap} from 'rxjs/operators';
import {InfoResponse} from './response/info-response';
import {CollectionValuesService} from '../collection-values.service';
import {AuthCollectionInfo} from './auth-collection-info';
import {QueryCommand} from './command/query-command';
import {QueryResponse} from './response/query-response';
import {CollectionValue} from './collection-value';
import {IPrefilter} from './prefilter/iprefilter';
import {UnsubscribeCommand} from './command/unsubscribe-command';
import {CollectionManagerService} from '../collection-manager.service';
import {CollectionHelper} from '../helper/collection-helper';
import {ConnectionManagerService} from '../connection/connection-manager.service';

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
              protected collectionValuesService: CollectionValuesService,
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
        let array = response.result;

        for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(this.prefilters)) {
          array = prefilter.execute(array);
        }

        return array;
      })
    );
  }

  /**
   * Get the values of the collection and also get updates if the collection has changed
   */
  public values(): Observable<Y> {
    const collectionValue = this.collectionValuesService
      .getCollectionValue(this.collectionName, this.contextName, this.prefilters, this.collectionInformation);
    return this.createCollectionObservable$(collectionValue, this.prefilters);
  }

  private createCollectionObservable$(collectionValue: CollectionValue<any>, prefilters: IPrefilter<any, any>[]): Observable<Y> {
    return <Observable<any>>collectionValue.subject.pipe(finalize(() => {
      collectionValue.subscriberCount--;

      if (collectionValue.subscriberCount === 0)  {
        this.connectionManagerService.sendCommand(
          new UnsubscribeCommand(this.collectionName, this.contextName, collectionValue.referenceId), false, true);
        collectionValue.socketSubscription.unsubscribe();
        this.collectionValuesService.removeCollectionValue(this.collectionName, collectionValue);
      }
    }), pipe(map((array: T[]) => {
      for (const prefilter of CollectionHelper.getPrefiltersWithoutAfterQueryPrefilters(prefilters)) {
        array = prefilter.execute(array);
      }

      return array;
    })));
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

  /**
   * Dispose this collection and remove it from collection storage
   */
  public dispose() {
    this.collectionManagerService.removeCollection(<any>this);
  }
}
