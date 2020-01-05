import {ConnectionBase} from './connection-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {ConnectionResponse} from '../command/connection/connection-response';
import {Observable, Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import {ConnectionInformation} from '../models/types';

export class WebsocketConnection extends ConnectionBase {
  private socketConnectionString: string;
  private socket: WebSocket;

  private connect$(): Observable<ConnectionInformation> {
    if (this.connectionInformation$.value.readyState === 'disconnected') {
      this.updateReadyState('connecting');

      this.socket = new WebSocket(this.socketConnectionString);

      this.socket.onmessage = (msg: MessageEvent) => {
        const message: ResponseBase = JSON.parse(msg.data);
        if (message.responseType === 'ConnectionResponse') {
          const connectionResponse = <ConnectionResponse>message;
          this.updateConnectionInformation('connected', connectionResponse.authTokenValid,
            this.connectionInformation$.value.authTokenActive, connectionResponse.connectionId);
          this.openHandler();
        } else {
          this.messageHandler(message);
        }
      };

      this.socket.onclose = () => {
        this.updateReadyState('disconnected');

        setTimeout(() => {
          this.connect$();
        }, 1000);
      };

      this.socket.onerror = () => {
        this.socket.close();
      };
    }

    return this.connectionInformation$.asObservable();
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    if (storedCommand && this.connectionInformation$.value.readyState !== 'connected') {
      return;
    }

    return this.connect$().pipe(
      takeWhile((connectionInformation) => connectionInformation.readyState !== 'disconnected' || !storedCommand),
      filter((connectionInformation) => connectionInformation.readyState === 'connected' && this.socket.readyState === WebSocket.OPEN),
      take(1)
    ).subscribe(() => {
      this.socket.send(JSON.stringify(object));
    });
  }

  setData(options: SapphireDbOptions, authToken?: string) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
    }

    this.updateConnectionInformation('disconnected', !!authToken, !!authToken, null);
    this.createConnectionString(options, authToken);

    setTimeout(() => {
      this.connect$();
    }, 10);
  }

  private createConnectionString(options: SapphireDbOptions, authToken?: string) {
    let url = `${options.useSsl ? 'wss' : 'ws'}://${options.serverBaseUrl}/sapphire/socket?`;

    if (options.apiSecret && options.apiKey) {
      url += `key=${options.apiKey}&secret=${options.apiSecret}&`;
    }

    if (!!authToken) {
      url += `authorization=${authToken}`;
    }

    this.socketConnectionString = url;
  }
}
