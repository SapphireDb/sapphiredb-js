import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {ConnectionResponse} from '../models/response/connection-response';
import {BehaviorSubject} from 'rxjs';
import {ConnectionState} from '../models/types';

export abstract class ConnectionBase {
  public connectionResponseHandler: (connectionResponse: ConnectionResponse) => void;
  public openHandler: () => void;
  public messageHandler: (message: ResponseBase) => void;

  public readyState$ = new BehaviorSubject<ConnectionState>('disconnected');

  public options: RealtimeDatabaseOptions;
  public bearer: string;

  public abstract send(object: CommandBase): void;
  public abstract dataUpdated(): void;
}
