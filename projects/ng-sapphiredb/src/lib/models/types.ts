export type ConnectionState = 'disconnected'|'connecting'|'connected';

export interface ConnectionInformation {
  readyState: ConnectionState;
  authTokenActive: boolean;
  authTokenValid: boolean;
  connectionId: string;
}

export type ClassType<T> = new (...args: any[]) => T;
