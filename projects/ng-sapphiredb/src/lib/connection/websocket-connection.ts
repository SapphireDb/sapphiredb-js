import {ConnectionBase} from './connection-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {ConnectionResponse} from '../command/connection/connection-response';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
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
          this.readyState$.next('connected');
          this.openHandler();
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

  send(object: CommandBase, storedCommand: boolean): Subscription {
    if (storedCommand && this.readyState$.value !== 'connected') {
      return;
    }

    return this.connect$().pipe(
      takeWhile((state) => state !== 'disconnected' || !storedCommand),
      filter((state) => state === 'connected' && this.socket.readyState === WebSocket.OPEN),
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
    let url = `${this.options.useSsl ? 'wss' : 'ws'}://${this.options.serverBaseUrl}/sapphire/socket?`;

    if (this.options.apiSecret && this.options.apiKey) {
      url += `key=${this.options.apiKey}&secret=${this.options.apiSecret}&`;
    }

    if (this.authToken) {
      url += `bearer=${this.authToken}`;
    }

    return url;
  }
}
