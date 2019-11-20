import {ConnectionResponse} from '../models/response/connection-response';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgZone} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ConnectionState} from '../models/types';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {filter, take} from 'rxjs/operators';
import {ConnectionBase} from './connection-base';

export class PollConnection extends ConnectionBase {
  private connectionData: ConnectionResponse;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  connect$(): Observable<ConnectionState> {
    if (this.readyState$.value === 'disconnected') {
      this.readyState$.next('connecting');

      const baseConnectionString = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/poll`;
      const connectionString = `${baseConnectionString}/init`;

      this.httpClient.get(connectionString, {
        headers: {
          key: this.options.apiKey ? this.options.apiKey : '',
          secret: this.options.apiSecret ? this.options.apiSecret : '',
          Authorization: `Bearer ${this.bearer}`
        }
      }).subscribe((response: ConnectionResponse) => {
        this.connectionData = response;
        this.connectionResponseHandler(this.connectionData);
        this.readyState$.next('connected');
        this.openHandler();
      }, (error) => {
        setTimeout(() => {
          this.readyState$.next('disconnected');
          this.connect$();
        }, 1000);
      });

      // this.eventSource.onmessage = (messageEvent) => {
      //   this.ngZone.run(() => {
      //     const message: ResponseBase = JSON.parse(messageEvent.data);
      //
      //     if (message.responseType === 'ConnectionResponse') {
      //       this.connectionData = <ConnectionResponse>message;
      //       this.connectionResponseHandler(this.connectionData);
      //       this.readyState$.next('connected');
      //       this.openHandler();
      //     } else {
      //       this.messageHandler(message);
      //     }
      //   });
      // };
    }

    return this.readyState$.asObservable();
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    if (storedCommand && this.readyState$.value !== 'connected') {
      return null;
    }

    return this.connect$().pipe(
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
        key: this.options.apiKey ? this.options.apiKey : '',
        secret: this.options.apiSecret ? this.options.apiSecret : '',
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
    this.readyState$.next('disconnected');

    setTimeout(() => {
      this.connect$();
    }, 30);
  }
}
