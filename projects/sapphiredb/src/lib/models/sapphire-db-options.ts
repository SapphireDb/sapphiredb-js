export interface SapphireDbOptions {
  /**
   * The connection to use. If left empty the best suiting connection type is automatically selected
   */
  connectionType?: 'websocket' | 'sse' | 'poll';

  /**
   * The base url of the server. If left empty the hostname and port of the current application is used.
   */
  serverBaseUrl?: string;

  /**
   * Use ssl to connect to server. If left empty the current ssl-settings are used.
   */
  useSsl?: boolean;

  /**
   * Api key to be used when connecting.
   */
  apiKey?: string;

  /**
   * Secret to be used when connecting.
   */
  apiSecret?: string;

  /**
   * Enable offline support and try to store collection data and changes locally when not connected to server.
   */
  offlineSupport?: boolean;

  /**
   * Enable optimization of offline changes.
   */
  offlineOptimization?: boolean;
}
