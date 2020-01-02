export type ConnectionState = 'disconnected'|'connecting'|'connected';

export type ClassType<T> = new (...args: any[]) => T;
