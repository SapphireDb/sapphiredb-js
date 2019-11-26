import {ResponseBase} from '../response-base';

export interface QueryConnectionsResponse extends ResponseBase {
  connections: RealtimeConnection[];
}

export interface RealtimeConnection {
  id: string;
  information: HttpInformation;
  type: 'Websocket'|'SSE'|'Poll';
}

export interface HttpInformation {
  remotePort: number;
  localPort: number;
  userId?: string;
  userAgent?: string;
  apiName: string;
}
