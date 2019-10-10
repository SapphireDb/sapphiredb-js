import {ConnectionBase} from './connection-base';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../models/command/command-base';
import {ResponseBase} from '../models/response/response-base';
import {NgZone} from '@angular/core';
import {ConnectionState} from '../models/types';
import {ConnectionResponse} from '../models/response/connection-response';

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
            this.openHandler();
            this.readyState$.next('connected');
          } else {
            this.messageHandler(message);
          }
        });
      };

      this.eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          this.bearer = null;
          this.readyState$.next('disconnected');

          setTimeout(() => {
            this.connect$();
          }, 1000);
        });
      };
    }

    return this.readyState$.asObservable();
  }

  send(object: CommandBase): void {
    this.connect$().pipe(
      filter((state) => state === 'connected'),
      take(1)
    ).subscribe(() => {
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {
    const url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/api/${command.commandType}`;

    this.httpClient.post(url, command, {
      headers: {
        secret: this.options.secret,
        connectionId: this.connectionData.connectionId,
        Authorization: `Bearer ${this.bearer}`
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
    }, 10);
  }

  private createConnectionString(): string {
    let url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/sse?`;

    if (this.options.secret) {
      url += `secret=${this.options.secret}&`;
    }

    if (this.bearer) {
      url += `bearer=${this.bearer}`;
    }

    return url;
  }
}
