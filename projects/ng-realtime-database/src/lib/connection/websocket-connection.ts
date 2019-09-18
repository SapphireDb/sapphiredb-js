import {ConnectionBase} from './connection-base';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {ConnectionResponse} from '../models/response/connection-response';

export class WebsocketConnection extends ConnectionBase {
  private socket: WebSocket;

  private options: RealtimeDatabaseOptions;
  private bearer: string;

  private ready = false;
  private connecting = false;

  private connect() {
    console.trace('connect called');

    if (this.connecting) {
      // this.ready = false;
      // this.connecting = false;
      //
      // if (this.socket) {
      //   this.socket.close();
      // }
      return false;
    }

    this.connecting = true;
    const connectionString = this.createConnectionString();
    this.socket = new WebSocket(connectionString);
    this.statusListener('connecting');

    this.socket.onopen = () => {
      const waitCommand = () => {
        if (this.socket.readyState !== WebSocket.OPEN) {
          setTimeout(waitCommand, 25);
          return;
        }
      };

      waitCommand();
    };

    this.socket.onmessage = (msg: MessageEvent) => {
      const message: ResponseBase = JSON.parse(msg.data);
      if (message.responseType === 'ConnectionResponse') {
        this.connectionResponseHandler(<ConnectionResponse>message);

        this.statusListener('ready');

        this.ready = true;
        this.connecting = false;
        this.openHandler();
      } else {
        this.messageHandler(message);
      }
    };

    this.socket.onclose = () => {
      this.ready = false;
      this.statusListener('disconnected');

      setTimeout(() => {
        this.statusListener('connecting');
        this.connect();
      }, 1000);
    };

    this.socket.onerror = () => {
      this.socket.close();
    };
  }

  send(object: CommandBase): boolean {
    if (this.ready) {
      this.socket.send(JSON.stringify(object));
      return true;
    } else {
      return false;
    }
  }

  setData(options: RealtimeDatabaseOptions, bearer: string) {
    this.options = options;
    this.bearer = bearer;

    // this.ready = false;
    // this.connecting = false;
    //
    if (this.socket) {
      this.socket.close();
    }
    setTimeout(() => {
      this.connect();
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
