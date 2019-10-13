import {ResponseBase} from './response-base';

export interface QueryConnectionsResponse extends ResponseBase {
  connections: RealtimeConnection[];
}

export interface RealtimeConnection {
  id: string;
  userId: string;
  userAgent?: string;
  type: 'Websocket';
  apiName: string;
}
