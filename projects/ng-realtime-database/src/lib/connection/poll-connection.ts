import {ConnectionResponse} from '../models/response/connection-response';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgZone} from '@angular/core';
import {BehaviorSubject, concat, Observable, of, Subscription} from 'rxjs';
import {ConnectionState} from '../models/types';
import {ResponseBase} from '../models/response/response-base';
import {CommandBase} from '../models/command/command-base';
import {catchError, concatMap, delay, filter, map, skip, take, takeUntil, tap} from 'rxjs/operators';
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
        setTimeout(() => {
          this.connectionData = response;
          this.connectionResponseHandler(this.connectionData);
          this.readyState$.next('connected');
          this.openHandler();
          this.startPolling(baseConnectionString);
        }, 500);
      }, (error) => {
        if (error.status === 401) {
          this.bearer = null;
        }

        this.readyState$.next('disconnected');

        setTimeout(() => {
          this.connect$();
        }, 1000);
      });
    }

    return this.readyState$.asObservable();
  }

  startPolling(baseConnectionString: string) {
    const load$ = new BehaviorSubject(null);

    const whenToRefresh$ = of(null).pipe(
      delay(this.options.pollingTime),
      tap(() => load$.next(null)),
      skip(1),
    );

    const poll$ = load$.pipe(
      concatMap(() => {
        const request$ = this.httpClient.get(baseConnectionString, {
          headers: {
            key: this.options.apiKey ? this.options.apiKey : '',
            secret: this.options.apiSecret ? this.options.apiSecret : '',
            connectionId: this.connectionData.connectionId,
            Authorization: `Bearer ${this.bearer}`
          }
        });

        return concat(request$, whenToRefresh$);
      }),
      takeUntil(
        this.readyState$.pipe(
          filter(s => s === 'disconnected')
        )
      )
    );

    poll$.subscribe((responses: ResponseBase[]) => {
      responses.forEach(response => this.messageHandler(response));
    }, (error) => {
      if (error.status === 404) {
        this.bearer = null;
      }

      this.readyState$.next('disconnected');

      setTimeout(() => {
        this.connect$();
      }, 1000);
    });
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
