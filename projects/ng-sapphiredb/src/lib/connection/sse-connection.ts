import {ConnectionBase} from './connection-base';
import {Observable, Subscription} from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../command/command-base';
import {ResponseBase} from '../command/response-base';
import {NgZone} from '@angular/core';
import {ConnectionState} from '../models/types';
import {ConnectionResponse} from '../command/connection/connection-response';

export class SseConnection extends ConnectionBase {
  private eventSource: EventSource;
  private connectionData: ConnectionResponse;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  connect$(): Observable<ConnectionState> {
    if (this.readyState$.value === 'disconnected') {
      this.readyState$.next('connecting');

      const connectionString = this.createConnectionString();
      this.eventSource = new EventSource(connectionString);

      this.eventSource.onopen = () => {

      };

      this.eventSource.onmessage = (messageEvent) => {
        this.ngZone.run(() => {
          const message: ResponseBase = JSON.parse(messageEvent.data);

          if (message.responseType === 'ConnectionResponse') {
            this.connectionData = <ConnectionResponse>message;
            this.connectionResponseHandler(this.connectionData);
            this.readyState$.next('connected');
            this.openHandler();
          } else {
            this.messageHandler(message);
          }
        });
      };

      this.eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          this.authToken = null;
          this.readyState$.next('disconnected');

          setTimeout(() => {
            this.connect$();
          }, 1000);
        });
      };
    }

    return this.readyState$.asObservable();
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    if (storedCommand && this.readyState$.value !== 'connected') {
      return null;
    }

    return this.connect$().pipe(
      filter((state) => state === 'connected' && this.eventSource.readyState === EventSource.OPEN),
      take(1)
    ).subscribe(() => {
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {
    const url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/sapphire/api/${command.commandType}`;

    this.httpClient.post(url, command, {
      headers: {
        key: this.options.apiKey ? this.options.apiKey : '',
        secret: this.options.apiSecret ? this.options.apiSecret : '',
        connectionId: this.connectionData.connectionId,
        Authorization: `Bearer ${this.authToken}`
      }
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

  dataUpdated() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.readyState$.next('disconnected');

    setTimeout(() => {
      this.connect$();
    }, 30);
  }

  private createConnectionString(): string {
    let url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/sapphire/sse?`;

    if (this.options.apiKey && this.options.apiSecret) {
      url += `key=${this.options.apiKey}&secret=${this.options.apiSecret}&`;
    }

    if (this.authToken) {
      url += `bearer=${this.authToken}`;
    }

    return url;
  }
}
