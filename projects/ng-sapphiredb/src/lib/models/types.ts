export enum ConnectionState {
  disconnected, connecting, connected
}

export interface ConnectionInformation {
  readyState: ConnectionState;
  connectionId: string;
}

export enum SortDirection {
  ascending, descending
}

export type ClassType<T> = new (...args: any[]) => T;
