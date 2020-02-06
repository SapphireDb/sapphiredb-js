import {Messaging} from './modules/messaging/messaging';
import {CollectionManager} from './collection/collection-manager';
import {ConnectionManager} from './connection/connection-manager';
import {AuthTokenState, ClassType, ConnectionInformation} from './models/types';
import {DefaultCollection} from './collection/default-collection';
import {Observable, of, ReplaySubject, Subject} from 'rxjs';
import {ActionResult} from './modules/action/action-result';
import {ExecuteCommand} from './command/execute/execute-command';
import {concatMap, filter, map, take, takeWhile} from 'rxjs/operators';
import {ExecuteResponse, ExecuteResponseType} from './command/execute/execute-response';
import {SapphireDbOptions} from './models/sapphire-db-options';
import {CollectionInformationManager} from './collection/collection-information-manager';
import {SapphireClassTransformer} from './helper/sapphire-class-transformer';
import {InitStreamResponse} from './command/stream/init-stream-response';
import {StreamCommand} from './command/stream/stream-command';
import {CompleteStreamCommand} from './command/stream/complete-stream-command';

export class SapphireDb {
  private collectionManager: CollectionManager;
  private connectionManager: ConnectionManager;

  /**
   * Sapphire messaging API
   */
  public messaging: Messaging;

  constructor(private options?: SapphireDbOptions, private classTransformer?: SapphireClassTransformer,
              private responseActionInterceptor?: (executeCode: () => void) => void) {
    const windowDefined = typeof window !== 'undefined';

    if (this.options.serverBaseUrl == null && windowDefined) {
      this.options.serverBaseUrl = `${window.location.hostname}:${window.location.port}`;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    if (!this.options.connectionType && windowDefined) {
      if (!!window['Websocket']) {
        this.options.connectionType = 'websocket';
      } else if (!!window['EventSource']) {
        this.options.connectionType = 'sse';
      } else {
        this.options.connectionType = 'poll';
      }
    }

    if (!this.options.pollingTime) {
      this.options.pollingTime = 300;
    }

    if (!this.responseActionInterceptor) {
      this.responseActionInterceptor = (executeCode: () => void) => executeCode();
    }

    this.connectionManager = new ConnectionManager(this.options, this.responseActionInterceptor);
    const collectionInformation = new CollectionInformationManager(this.connectionManager);

    this.collectionManager = new CollectionManager(this.connectionManager, collectionInformation, this.classTransformer);
    this.messaging = new Messaging(this.connectionManager);
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
  public execute<TResponseType = null, TNotificationType = null>(handlerName: string, actionName: string, ...parameters: any[])
    : Observable<ActionResult<TResponseType, TNotificationType>> {
    const sendObservable$ = this.connectionManager.sendCommand(new ExecuteCommand(handlerName, actionName, parameters), true);

    // Test to run async stream to server
    if (parameters) {
      const subjectIndex = parameters.findIndex(p => p instanceof ReplaySubject);

      if (subjectIndex !== -1) {
        const subject$: ReplaySubject<any> = parameters[subjectIndex];
        parameters[subjectIndex] = null;

        sendObservable$.pipe(
          filter(r => r.responseType === 'InitStreamResponse'),
          take(1)
        ).subscribe((initStreamResponse: InitStreamResponse) => {
          subject$.subscribe({
            complete: () => this.connectionManager.sendCommand(new CompleteStreamCommand(initStreamResponse.id), false, true),
            error: () => this.connectionManager.sendCommand(new CompleteStreamCommand(initStreamResponse.id), false, true),
            next: (value) => this.connectionManager.sendCommand(new StreamCommand(initStreamResponse.id, value), false, true)
          });
        });
      }
    }

    return sendObservable$.pipe(
      filter(r => r.responseType !== 'InitStreamResponse'),
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
    return this.connectionManager.connection.connectionInformation$.asObservable();
  }

  /**
   * Reconnect to the connectionManagerService with authentication
   * @param authToken The token to use for authentication/authorization, if empty removes the JWT Token
   */
  public setAuthToken(authToken?: string): Observable<AuthTokenState> {
    return this.connectionManager.setAuthToken(authToken);
  }

  /**
   * Reset the current session. Useful if you want to reset when the current user logged out.
   */
  public reset() {
    this.connectionManager.reset();
  }
}
