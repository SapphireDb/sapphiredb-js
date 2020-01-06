export type ConnectionState = 'disconnected'|'connecting'|'connected';

export interface ConnectionInformation {
  readyState: ConnectionState;
  connectionId: string;
}

export type ClassType<T> = new (...args: any[]) => T;
