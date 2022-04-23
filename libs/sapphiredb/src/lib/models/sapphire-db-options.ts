export interface SapphireDbOptions {
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
   * Enables local handling and preview of operations before server execution for faster result displaying
   */
  enableLocalChangePreview?: boolean;

  /**
   * Custom version information that is sent to server during connection
   */
  clientVersion?: string;
}
