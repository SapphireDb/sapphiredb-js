export interface RealtimeDatabaseOptions {
  connectionType?: 'websocket'|'sse';
  serverBaseUrl?: string;
  useSsl?: boolean;
  apiKey?: string;
  apiSecret?: string;

  loginRedirect?: string;
  unauthorizedRedirect?: string;
}
