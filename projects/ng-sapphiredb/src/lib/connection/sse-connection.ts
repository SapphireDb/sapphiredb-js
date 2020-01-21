import {ConnectionBase} from './connection-base';
import {Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import {CommandBase} from '../command/command-base';
import {ResponseBase} from '../command/response-base';
import {ConnectionState} from '../models/types';
import {ConnectionResponse} from '../command/connection/connection-response';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {AxiosError, AxiosResponse, default as axios} from 'axios';

export class SseConnection extends ConnectionBase {
  private sseConnectionString: string;
  private apiConnectionString: string;

  private options: SapphireDbOptions;

  private headers: { key: string, secret: string, connectionId?: string, Authorization?: string };

  private eventSource: EventSource;

  constructor() {
    super();
  }

  private connect() {
    if (this.connectionInformation$.value.readyState === ConnectionState.disconnected) {
      this.updateConnectionInformation(ConnectionState.connecting);

      this.eventSource = new EventSource(this.sseConnectionString);

      this.eventSource.onmessage = (messageEvent) => {
        const message: ResponseBase = JSON.parse(messageEvent.data);

        if (message.responseType === 'ConnectionResponse') {
          const connectionData = <ConnectionResponse>message;
          this.headers.connectionId = connectionData.connectionId;
          this.updateConnectionInformation(ConnectionState.connected, connectionData.connectionId);
        } else {
          this.messageHandler(message);
        }
      };

      this.eventSource.onerror = (error) => {
        setTimeout(() => {
          this.connect();
        }, 1000);
      };
    }
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    return this.connectionInformation$.pipe(
      takeWhile((connectionInformation) => connectionInformation.readyState !== ConnectionState.disconnected || !storedCommand),
      filter((connectionInformation) => connectionInformation.readyState === ConnectionState.connected),
      take(1)
    ).subscribe(() => {
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {
    const url = `${this.apiConnectionString}${command.commandType}`;

    axios.post(url, command, {
      headers: this.headers
    }).then((axiosResponse: AxiosResponse<ResponseBase>) => {
      if (!!axiosResponse.data) {
        this.messageHandler(axiosResponse.data);
      }
    }).catch((error: AxiosError<ResponseBase>) => {
      this.messageHandler(error.response.data);
    });
  }

  setData(options: SapphireDbOptions, authToken?: string) {
    this.updateConnectionInformation(ConnectionState.disconnected);

    if (this.eventSource) {
      this.eventSource.close();
    }

    this.setConnectionData(options, authToken);
    this.connect();
  }

  private setConnectionData(options: SapphireDbOptions, authToken?: string) {
    let sseConnectionString = `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/sse?`;

    if (options.apiKey && options.apiSecret) {
      sseConnectionString += `key=${options.apiKey}&secret=${options.apiSecret}&`;
    }

    if (!!authToken) {
      sseConnectionString += `authorization=${authToken}`;
    }

    this.headers = {
      key: options.apiKey ? options.apiKey : '',
      secret: options.apiSecret ? options.apiSecret : ''
    };

    if (!!authToken) {
      this.headers.Authorization = `Bearer ${authToken}`;
    }

    this.options = options;
    this.sseConnectionString = sseConnectionString;
    this.apiConnectionString = `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/api/`;
  }
}
