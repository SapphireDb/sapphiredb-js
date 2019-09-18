import {Observable} from 'rxjs';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {ConnectionResponse} from '../models/response/connection-response';

export abstract class ConnectionBase {
  public connectionResponseHandler: (connectionResponse: ConnectionResponse) => void;
  public openHandler: () => void;
  public messageHandler: (message: ResponseBase) => void;
  public statusListener: (status) => void;

  public abstract send(object: CommandBase): boolean;
  public abstract setData(options: RealtimeDatabaseOptions, bearer: string);
}
