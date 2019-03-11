import {ResponseBase} from './response-base';

export interface QueryConnectionsResponse extends ResponseBase {
  connections: WebsocketConnection[];
}

export interface WebsocketConnection {
  id: string;
  userId: string;
  userAgent?: string;
}
