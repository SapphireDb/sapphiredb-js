import {InjectionToken} from '@angular/core';

export interface RealtimeDatabaseOptions {
  connectionType?: 'websocket'|'sse'|'poll';
  serverBaseUrl?: string;
  useSsl?: boolean;
  apiKey?: string;
  apiSecret?: string;
  pollingTime?: number;

  loginRedirect?: string;
  unauthorizedRedirect?: string;
}

export const REALTIME_DATABASE_OPTIONS = new InjectionToken<RealtimeDatabaseOptions>('realtimedatabase.options');
