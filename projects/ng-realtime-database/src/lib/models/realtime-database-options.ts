export interface RealtimeDatabaseOptions {
  connectionType?: 'websocket'|'sse'|'rest';
  serverBaseUrl?: string;
  useSsl?: boolean;
  secret?: string;

  loginRedirect?: string;
  unauthorizedRedirect?: string;
}
