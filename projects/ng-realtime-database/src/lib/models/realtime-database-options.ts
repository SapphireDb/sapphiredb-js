export interface RealtimeDatabaseOptions {
  connectionType?: 'websocket'|'sse'|'poll';
  serverBaseUrl?: string;
  useSsl?: boolean;
  apiKey?: string;
  apiSecret?: string;

  loginRedirect?: string;
  unauthorizedRedirect?: string;
}
