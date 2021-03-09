import {ConnectionBase} from './connection-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {ConnectionResponse} from '../command/connection/connection-response';
import {Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import {ConnectionState} from '../models/types';

export class WebsocketConnection extends ConnectionBase {
  private socketConnectionString: string;
  private socketProtocols: string[];
  private socket: WebSocket;

  private closeForced = false;

  private connect() {
    if (this.connectionInformation$.value.readyState === ConnectionState.disconnected) {
      this.updateConnectionInformation(ConnectionState.connecting);

      this.checkAuthToken().pipe(take(1)).subscribe(() => {
        this.socket = new WebSocket(this.socketConnectionString, this.socketProtocols);

        this.socket.onmessage = (msg: MessageEvent) => {
          const message: ResponseBase = JSON.parse(msg.data);
          if (message.responseType === 'ConnectionResponse') {
            const connectionResponse = <ConnectionResponse>message;
            this.updateConnectionInformation(ConnectionState.connected, connectionResponse.connectionId);
          } else {
            this.messageHandler(message);
          }
        };

        this.socket.onclose = () => {
          if (this.closeForced) {
            this.closeForced = false;
            return;
          }

          this.updateConnectionInformation(ConnectionState.disconnected);

          setTimeout(() => {
            this.connect();
          }, 1000);
        };

        this.socket.onerror = () => {
          this.socket.close();
        };
      });
    }
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    return this.connectionInformation$.pipe(
      takeWhile((connectionInformation) => connectionInformation.readyState !== ConnectionState.disconnected || !storedCommand),
      filter((connectionInformation) => connectionInformation.readyState === ConnectionState.connected),
      take(1)
    ).subscribe(() => {
      this.sendInternal(JSON.stringify(object));
    });
  }

  private sendInternal(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      setTimeout(() => {
        this.sendInternal(message);
      }, 0);
    }
  }

  setData(options: SapphireDbOptions, authToken?: string) {
    this.updateConnectionInformation(ConnectionState.disconnected);

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.closeForced = true;
      this.socket.close();
    }

    this.createConnectionString(options, authToken);
    this.connect();
  }

  private createConnectionString(options: SapphireDbOptions, authToken?: string) {
    this.socketConnectionString = `${options.useSsl ? 'wss' : 'ws'}://${options.serverBaseUrl}/sapphire/socket`;
    this.socketProtocols = ['sapphire'];

    if (options.apiSecret && options.apiKey) {
      this.socketProtocols.push('key', options.apiKey, 'secret', options.apiSecret);
    }

    if (!!authToken) {
      this.socketProtocols.push('authorization', authToken);
    }
  }
}
