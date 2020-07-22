export enum ConnectionState {
  disconnected, connecting, connected
}

export enum AuthTokenState {
  valid, error, invalid, not_set, validating
}

export interface ConnectionInformation {
  readyState: ConnectionState;
  connectionId: string;
}

export enum SortDirection {
  ascending, descending
}

export type ClassType<T> = new (...args: any[]) => T;

export interface PrimaryKeyEntry {
  type: Function;
  primaryKeys: string[];
}
