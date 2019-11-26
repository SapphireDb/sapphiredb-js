import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {ConnectionResponse} from '../command/connection/connection-response';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ConnectionState} from '../models/types';

export abstract class ConnectionBase {
  public connectionResponseHandler: (connectionResponse: ConnectionResponse) => void;
  public openHandler: () => void;
  public messageHandler: (message: ResponseBase) => void;

  public readyState$ = new BehaviorSubject<ConnectionState>('disconnected');

  public options: RealtimeDatabaseOptions;
  public bearer: string;

  public abstract send(object: CommandBase, storedCommand: boolean): Subscription;
  public abstract dataUpdated(): void;
}
