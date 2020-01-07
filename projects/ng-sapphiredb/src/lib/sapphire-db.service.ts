import {Injectable} from '@angular/core';
import {CollectionManagerService} from './collection/services/collection-manager.service';
import {ExecuteCommand} from './command/execute/execute-command';
import {concatMap, map, takeWhile} from 'rxjs/operators';
import {ExecuteResponse, ExecuteResponseType} from './command/execute/execute-response';
import {Observable, of} from 'rxjs';
import {ActionResult} from './modules/action/action-result';
import {Messaging} from './modules/messaging/messaging';
import {DefaultCollection} from './collection/default-collection';
import {ConnectionManagerService} from './connection/services/connection-manager.service';
import {ClassType, ConnectionInformation} from './models/types';

@Injectable()
export class SapphireDb {
  /**
   * Sapphire messaging API
   */
  public messaging: Messaging;

  constructor(private collectionManager: CollectionManagerService, private connectionManagerService: ConnectionManagerService) {
    this.messaging = new Messaging(this.connectionManagerService);
  }

  /**
   * Get the named collection
   * @param collectionName The name of the collection
   * @param classType The class of the model (optional parameter and only used when using a class transformer)
   */
  public collection<T>(collectionName: string, classType: ClassType<T> = null): DefaultCollection<T> {
    return <any>this.collectionManager.getCollection(collectionName, [], null, classType);
  }

  /**
   * Execute an action on the server
   * @param handlerName The name of the handler
   * @param actionName The name of the action
   * @param parameters Parameters for the action
   */
  public execute<TResponseType, TNotificationType = null>(handlerName: string, actionName: string, ...parameters: any[])
    : Observable<ActionResult<TResponseType, TNotificationType>> {
    return this.connectionManagerService.sendCommand(new ExecuteCommand(handlerName, actionName, parameters), true).pipe(
      concatMap((result: ExecuteResponse) => {
        if (result.type === ExecuteResponseType.End) {
          return of(result, null);
        }

        return of(result);
      }),
      takeWhile(v => !!v),
      map((result: ExecuteResponse) => {
        return new ActionResult<TResponseType, TNotificationType>(result);
      })
    );
  }

  /**
   * Returns the connection information (state, id, auth token)
   */
  public getConnectionInformation$(): Observable<ConnectionInformation> {
    return this.connectionManagerService.connection.connectionInformation$.asObservable();
  }

  /**
   * Reconnect to the connectionManagerService with authentication
   * @param authToken The token to use for authentication/authorization, if empty removes the JWT Token
   */
  public setAuthToken(authToken?: string): Observable<'valid'|'error'|'invalid'>|null {
    return this.connectionManagerService.setAuthToken(authToken);
  }

  /**
   * Reset the current session. Useful if you want to reset when the current user logged out.
   */
  public reset() {
    this.connectionManagerService.reset();
  }
}
