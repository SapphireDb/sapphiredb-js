import {ConnectionBase} from './connection-base';
import {Observable, Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../command/command-base';
import {ResponseBase} from '../command/response-base';
import {NgZone} from '@angular/core';
import {ConnectionInformation, ConnectionState} from '../models/types';
import {ConnectionResponse} from '../command/connection/connection-response';
import {SapphireDbOptions} from '../models/sapphire-db-options';

export class SseConnection extends ConnectionBase {
  private sseConnectionString: string;
  private apiConnectionString: string;

  private options: SapphireDbOptions;

  private headers: { key: string, secret: string, connectionId?: string, Authorization?: string };

  private eventSource: EventSource;

  private errorCount = 0;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  private connect() {
    if (this.connectionInformation$.value.readyState === 'disconnected') {
      this.updateConnectionInformation('connecting');

      this.eventSource = new EventSource(this.sseConnectionString);

      this.eventSource.onmessage = (messageEvent) => {
        this.ngZone.run(() => {
          const message: ResponseBase = JSON.parse(messageEvent.data);

          if (message.responseType === 'ConnectionResponse') {
            const connectionData = <ConnectionResponse>message;
            this.headers.connectionId = connectionData.connectionId;
            this.updateConnectionInformation('connected', connectionData.connectionId);
          } else {
            this.messageHandler(message);
          }
        });
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
      takeWhile((connectionInformation) => connectionInformation.readyState !== 'disconnected' || !storedCommand),
      filter((connectionInformation) => connectionInformation.readyState === 'connected'),
      take(1)
    ).subscribe(() => {
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {
    const url = `${this.apiConnectionString}${command.commandType}`;

    this.httpClient.post(url, command, {
      headers: this.headers
    }).subscribe((response: ResponseBase) => {
      if (!!response) {
        this.ngZone.run(() => {
          this.messageHandler(response);
        });
      }
    }, (error: HttpErrorResponse) => {
      if (!!error) {
        this.ngZone.run(() => {
          this.messageHandler(error.error);
        });
      }
    });
  }

  setData(options: SapphireDbOptions, authToken?: string) {
    this.updateConnectionInformation('disconnected');

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
