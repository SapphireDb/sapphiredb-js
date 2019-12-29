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
   * @param contextName If using multiple DbContexts you can pass this to get the right context
   */
  public collection<T>(collectionName: string, contextName: string = 'default'): DefaultCollection<T> {
    return <any>this.collectionManager.getCollection(collectionName, contextName, []);
  }

  /**
   * Execute an action on the server
   * @param handlerName The name of the handler
   * @param actionName The name of the action
   * @param parameters Parameters for the action
   */
  public execute<X, Y>(handlerName: string, actionName: string, ...parameters: any[]): Observable<ActionResult<X, Y>> {
    return this.connectionManagerService.sendCommand(new ExecuteCommand(handlerName, actionName, parameters), true).pipe(
      concatMap((result: ExecuteResponse) => {
        if (result.type === ExecuteResponseType.End) {
          return of(result, null);
        }

        return of(result);
      }),
      takeWhile(v => !!v),
      map((result: ExecuteResponse) => {
        return new ActionResult<X, Y>(result);
      })
    );
  }

  /**
   * Returns the connection status
   */
  public getStatus$(): Observable<string> {
    return this.connectionManagerService.status$.asObservable();
  }

  /**
   * Reconnect to the connectionManagerService with authentication
   * @param authToken The token to use for authentication/authorization, if empty removes the JWT Token
   */
  public setAuthToken(authToken?: string): void {
    this.connectionManagerService.setAuthToken(authToken);
  }

  /**
   * Reset the current session. Useful if you want to reset when the current user logged out.
   */
  public reset() {
    this.connectionManagerService.reset();
  }
}
