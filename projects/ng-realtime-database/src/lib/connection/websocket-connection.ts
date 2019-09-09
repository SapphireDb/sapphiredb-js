import {BehaviorSubject, Observable, of} from 'rxjs';
import {ConnectionBase} from './connection-base';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';

export class WebsocketConnection extends ConnectionBase {
  private connectionString: string;

  private socket: WebSocket;
  private connectSubject$: BehaviorSubject<boolean>;

  private openHandler: () => void;
  private messageHandler: (message: ResponseBase) => void;
  private statusListener: (status) => void;

  private options: RealtimeDatabaseOptions;
  private bearer: string;

  connect$(connectionFailed?: boolean): Observable<boolean> {
    const connectionString = this.createConnectionString();

    if (this.connectionString === connectionString && !connectionFailed) {
      if (this.connectSubject$) {
        return this.connectSubject$.asObservable();
      } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return of(true);
      }
    }

    this.connectionString = connectionString;
    this.socket = new WebSocket(this.connectionString);

    if (!connectionFailed && !this.connectSubject$) {
      this.connectSubject$ = new BehaviorSubject<boolean>(false);
      this.statusListener('connecting');
    }

    this.socket.onopen = () => {
      const waitCommand = () => {
        if (this.socket.readyState !== WebSocket.OPEN) {
          setTimeout(waitCommand, 25);
          return;
        }

        this.openHandler();
        this.statusListener('ready');

        if (this.connectSubject$) {
          this.connectSubject$.next(true);
          this.connectSubject$.complete();
          this.connectSubject$ = null;
        }
      };

      waitCommand();
    };

    this.socket.onmessage = (msg: MessageEvent) => {
      this.messageHandler(JSON.parse(msg.data));
    };

    this.socket.onclose = () => {
      this.statusListener('disconnected');

      setTimeout(() => {
        this.statusListener('connecting');
        this.connect$(true);
      }, 1000);
    };

    this.socket.onerror = () => {
      this.socket.close();
    };

    return this.connectSubject$.asObservable();
  }

  registerOnMessage(messageHandler: (message: ResponseBase) => void): void {
    this.messageHandler = messageHandler;
  }

  send(object: CommandBase) {
    this.socket.send(JSON.stringify(object));
  }

  registerStatusListener(statusListener: (status) => void): void {
    this.statusListener = statusListener;
  }

  registerOnOpen(openHandler: () => void): void {
    this.openHandler = openHandler;
  }

  reConnect() {
    if (this.socket) {
      this.socket.onclose = () => {};
      this.socket.close();
    }

    setTimeout(() => {
      this.connect$();
    }, 10);
  }

  setData(options: RealtimeDatabaseOptions, bearer: string) {
    this.options = options;
    this.bearer = bearer;
  }

  private createConnectionString(): string {
    let url = `${this.options.useSsl ? 'wss' : 'ws'}://${this.options.serverBaseUrl}/realtimedatabase/socket?`;

    if (this.options.secret) {
      url += `secret=${this.options.secret}&`;
    }

    if (this.bearer) {
      url += `bearer=${this.bearer}`;
    }

    return url;
  }
}
