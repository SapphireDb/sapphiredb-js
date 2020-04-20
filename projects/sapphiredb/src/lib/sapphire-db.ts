import {Messaging} from './modules/messaging/messaging';
import {CollectionManager} from './collection/collection-manager';
import {ConnectionManager} from './connection/connection-manager';
import {AuthTokenState, ClassType, ConnectionInformation, ConnectionState} from './models/types';
import {DefaultCollection} from './collection/default-collection';
import {EMPTY, Observable, of, ReplaySubject} from 'rxjs';
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
import {ResponseBase} from './command/response-base';
import {SapphireStorage} from './helper/sapphire-storage';
import {OfflineManager} from './modules/offline/offline-manager';
import {ExecuteCommandsResponse} from './command/execute-commands/execute-commands-response';
import {ActionSender} from './modules/action/action-sender';

export class SapphireDb {
  private collectionManager: CollectionManager;
  private connectionManager: ConnectionManager;
  private offlineManager: OfflineManager;

  /**
   * Sapphire messaging API
   */
  public messaging: Messaging;

  constructor(private options?: SapphireDbOptions,
              private storage?: SapphireStorage,
              private classTransformer?: SapphireClassTransformer,
              private responseActionInterceptor?: (executeCode: () => void) => void) {
    const windowDefined = typeof window !== 'undefined';

    if (this.options.serverBaseUrl == null && windowDefined) {
      this.options.serverBaseUrl = `${window.location.hostname}:${window.location.port}`;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    if (!this.options.connectionType && windowDefined) {
      if (!!window['WebSocket']) {
        this.options.connectionType = 'websocket';
      } else if (!!window['EventSource']) {
        this.options.connectionType = 'sse';
      } else {
        this.options.connectionType = 'poll';
      }
    }

    this.options.offlineSupport = !!this.options.offlineSupport;

    if (!this.responseActionInterceptor) {
      this.responseActionInterceptor = (executeCode: () => void) => executeCode();
    }

    this.connectionManager = new ConnectionManager(this.options, this.responseActionInterceptor);

    if (this.options.offlineSupport) {
      this.offlineManager = new OfflineManager(storage, this.connectionManager, this.options.offlineOptimization);
    }

    const collectionInformation = new CollectionInformationManager(this.connectionManager, this.offlineManager);

    this.collectionManager = new CollectionManager(this.connectionManager, collectionInformation, this.classTransformer,
      this.offlineManager);
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
   * @param action The action to call. Action handler and action name separated with a dot (handler.action)
   * @param parameters Parameters for the action
   */
  public execute<TResponseType = null, TNotificationType = null>(action: string, ...parameters: any[])
    : Observable<ActionResult<TResponseType, TNotificationType>> {
    return ActionSender.handleActionExecution$(this.connectionManager, action, parameters);
  }

  /**
   * Returns the connection information (state, id, auth token)
   */
  public getConnectionInformation(): Observable<ConnectionInformation> {
    return this.connectionManager.connection.connectionInformation$.asObservable();
  }

  /**
   * Checks if the client is connected to server
   */
  public online(): Observable<boolean> {
    return this.getConnectionInformation().pipe(
      map(v => v.readyState === ConnectionState.connected)
    );
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
  public reset(resetOfflineManager = false) {
    this.connectionManager.reset();

    if (resetOfflineManager) {
      this.offlineManager.reset();
    }
  }

  /**
   * Get transfer results of offline changes (Primarily for merge conflict handling)
   */
  public offlineTransferResults(): Observable<ExecuteCommandsResponse | null> {
    if (this.offlineManager) {
      return this.offlineManager.offlineTransferResults$.asObservable();
    }

    return EMPTY;
  }
}
