import {ConnectionBase} from './connection-base';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {ConnectionResponse} from '../models/response/connection-response';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {ConnectionState} from '../models/types';

export class WebsocketConnection extends ConnectionBase {
  private socket: WebSocket;

  private connect$(): Observable<ConnectionState> {
    if (this.readyState$.value === 'disconnected') {
      this.readyState$.next('connecting');

      const connectionString = this.createConnectionString();
      this.socket = new WebSocket(connectionString);

      this.socket.onmessage = (msg: MessageEvent) => {
        const message: ResponseBase = JSON.parse(msg.data);
        if (message.responseType === 'ConnectionResponse') {
          this.connectionResponseHandler(<ConnectionResponse>message);
          this.openHandler();
          this.readyState$.next('connected');
        } else {
          this.messageHandler(message);
        }
      };

      this.socket.onclose = () => {
        this.readyState$.next('disconnected');

        setTimeout(() => {
          this.connect$();
        }, 1000);
      };

      this.socket.onerror = () => {
        this.socket.close();
      };
    }

    return this.readyState$.asObservable();
  }

  send(object: CommandBase): void {
    this.connect$().pipe(
      filter((state) => state === 'connected'),
      take(1)
    ).subscribe(() => {
      this.socket.send(JSON.stringify(object));
    });
  }

  dataUpdated() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
    }

    setTimeout(() => {
      this.connect$();
    }, 10);
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
