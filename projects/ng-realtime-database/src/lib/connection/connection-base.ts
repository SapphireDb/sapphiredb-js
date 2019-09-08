import {Observable} from 'rxjs';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';

export abstract class ConnectionBase {
  public abstract send(object: CommandBase, connectionId$?: Observable<string>);

  public abstract connect$(): Observable<boolean>;
  public abstract reConnect();

  public abstract setData(options: RealtimeDatabaseOptions, bearer: string);

  public abstract registerOnOpen(openHandler: () => void): void;
  public abstract registerOnMessage(messageHandler: (message: ResponseBase) => void): void;
  public abstract registerStatusListener(statusListener: (status) => void): void;
}
