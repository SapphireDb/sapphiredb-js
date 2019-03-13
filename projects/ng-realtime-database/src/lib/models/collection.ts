import {Observable} from 'rxjs';
import {WebsocketService} from '../websocket.service';
import {CreateCommand} from './command/create-command';
import {CreateResponse} from './response/create-response';
import {CommandResult} from './command-result';
import {DeleteResponse} from './response/delete-response';
import {UpdateCommand} from './command/update-command';
import {UpdateResponse} from './response/update-response';
import {DeleteCommand} from './command/delete-command';
import {map, switchMap} from 'rxjs/operators';
import {InfoResponse} from './response/info-response';
import {CollectionValuesService} from '../collection-values.service';
import {CollectionBase} from './collection-base';

export class Collection<T> extends CollectionBase<T> {

  constructor(collectionName: string,
              websocket: WebsocketService,
              collectionInformation: Observable<InfoResponse>,
              collectionValuesService: CollectionValuesService) {
    super(collectionName, websocket, collectionInformation, collectionValuesService);
  }

  /**
   * Add a value to the collection
   * @param value The object to add to the collection
   */
  public add(value: T): Observable<CommandResult<T>> {
    return this.createCommandResult$(<any>this.websocket.sendCommand(new CreateCommand(this.collectionName, value)));
  }

  /**
   * Update a value of the collection
   * @param value The object to update in the collection
   */
  public update(value: T): Observable<CommandResult<T>> {
    return this.createCommandResult$(<any>this.websocket.sendCommand(new UpdateCommand(this.collectionName, value)));
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

        const deleteCommand = new DeleteCommand(this.collectionName, primaryValues);
        return this.websocket.sendCommand(deleteCommand).pipe(map((response: DeleteResponse) => {
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
}
