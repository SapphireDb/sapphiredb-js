export interface SapphireDbOptions {
  connectionType?: 'websocket'|'sse'|'poll';
  serverBaseUrl?: string;
  useSsl?: boolean;
  apiKey?: string;
  apiSecret?: string;
  pollingTime?: number;
  offlineSupport?: boolean;
}
