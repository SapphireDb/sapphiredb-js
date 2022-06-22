import {Messaging} from './modules/messaging/messaging';
import {CollectionManager} from './collection/collection-manager';
import {ConnectionManager} from './connection/connection-manager';
import {ClassType} from './models/types';
import {DefaultCollection} from './collection/default-collection';
import {EMPTY, Observable} from 'rxjs';
import {ActionResult} from './modules/action/action-result';
import {SapphireDbOptions} from './models/sapphire-db-options';
import {SapphireClassTransformer} from './helper/sapphire-class-transformer';
import {SapphireStorage} from './helper/sapphire-storage';
import {OfflineManager} from './modules/offline/offline-manager';
import {ExecuteCommandsResponse} from './command/execute-commands/execute-commands-response';
import {ActionSender} from './modules/action/action-sender';
import {QueryCollection} from './collection/query-collection';

export class SapphireDb {
  private collectionManager: CollectionManager;
  private connectionManager: ConnectionManager;
  private offlineManager?: OfflineManager;

  /**
   * Sapphire messaging API
   */
  public messaging: Messaging;

  constructor(private options: SapphireDbOptions,
              private storage?: SapphireStorage,
              private classTransformer?: SapphireClassTransformer,
              private responseActionInterceptor?: (executeCode: () => void) => void,
              private startupToken?: string) {
    const windowDefined = typeof window !== 'undefined';

    if (this.options.serverBaseUrl == null && windowDefined) {
      this.options.serverBaseUrl = `${window.location.hostname}:${window.location.port}`;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    this.options.offlineSupport = !!this.options.offlineSupport;

    if (!this.responseActionInterceptor) {
      this.responseActionInterceptor = (executeCode: () => void) => executeCode();
    }

    this.connectionManager = new ConnectionManager(this.options, this.responseActionInterceptor, this.startupToken);

    if (this.options.offlineSupport && storage) {
      this.offlineManager = new OfflineManager(storage, this.connectionManager);
    }

    this.collectionManager = new CollectionManager(this.connectionManager, this.classTransformer, this.offlineManager,
      this.options.enableLocalChangePreview);
    this.messaging = new Messaging(this.connectionManager);
  }

  /**
   * Get the named collection
   * @param collectionName The name of the collection
   * @param classType The class of the model (optional parameter and only used when using a class transformer)
   */
  public collection<T>(collectionName: string, classType?: ClassType<T>): DefaultCollection<T> {
    return <any>this.collectionManager.getCollection(collectionName, [], undefined, classType);
  }

  /**
   * Get the named query
   * @param queryName The name of the query
   * @param parameters Optional parameters used for the query creation on server side
   * @param classType The class of the model (optional parameter and only used when using a class transformer)
   */
  public query<TModel, TReturnType = TModel[]>(queryName: string, parameters: any[] = [], classType?: ClassType<TModel>): QueryCollection<TModel, TReturnType> {
    return this.collectionManager.getQueryCollection(queryName, parameters, classType);
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
   * Checks if the client is connected to server
   */
  public online(): Observable<boolean> {
    return this.connectionManager.online$;
  }

  /**
   * Reconnect to the connectionManagerService with authentication
   * @param authToken The token to use for authentication/authorization, if empty removes the token
   */
  public setAuthToken(authToken?: string): void {
    this.connectionManager.setAuthToken(authToken);
  }

  /**
   * Reset the current session. Useful if you want to reset when the current user logged out.
   */
  public reset(resetOfflineManager = false) {
    this.connectionManager.reset();

    if (resetOfflineManager) {
      this.offlineManager?.reset();
    }
  }

  /**
   * Get transfer results of offline changes (mainly for merge conflict handling)
   */
  public offlineTransferResults(): Observable<ExecuteCommandsResponse | undefined> {
    if (this.offlineManager) {
      return this.offlineManager.offlineTransferResults$.asObservable();
    }

    return EMPTY;
  }

  /**
   * Event that fires when auth token is expired. Useful to refresh token when needed
   */
  public authTokenExpired(): Observable<string> {
    return this.connectionManager.authTokenExpired$.asObservable();
  }

  /**
   * Clean up session
   */
  public dispose(): void {
    this.connectionManager.dispose();
  }
}
