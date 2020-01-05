import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ConnectionInformation, ConnectionState} from '../models/types';

export abstract class ConnectionBase {
  public openHandler: () => void;
  public messageHandler: (message: ResponseBase) => void;

  public connectionInformation$ = new BehaviorSubject<ConnectionInformation>({
    authTokenActive: false,
    authTokenValid: false,
    connectionId: null,
    readyState: 'disconnected'
  });

  public abstract send(object: CommandBase, storedCommand: boolean): Subscription;
  public abstract setData(options: SapphireDbOptions, authToken?: string): void;

  public updateConnectionInformation(readyState: ConnectionState, authTokenValid: boolean, authTokenActive: boolean, connectionId: string) {
    const connectionInformation = this.connectionInformation$.value;
    connectionInformation.readyState = readyState;
    connectionInformation.authTokenValid = authTokenValid;
    connectionInformation.authTokenActive = authTokenActive;
    connectionInformation.connectionId = connectionId;
    this.connectionInformation$.next(connectionInformation);
  }

  public updateReadyState(readyState: ConnectionState) {
    const connectionInformation = this.connectionInformation$.value;
    connectionInformation.readyState = readyState;
    this.connectionInformation$.next(connectionInformation);
  }
}
