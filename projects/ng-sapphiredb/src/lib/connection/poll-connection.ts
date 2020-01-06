import {ConnectionResponse} from '../command/connection/connection-response';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgZone} from '@angular/core';
import {BehaviorSubject, concat, Observable, of, Subscription} from 'rxjs';
import {ConnectionInformation, ConnectionState} from '../models/types';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {catchError, concatMap, delay, filter, map, skip, take, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {ConnectionBase} from './connection-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';

export class PollConnection extends ConnectionBase {
  private headers: { key: string, secret: string, Authorization?: string, connectionId?: string };

  private pollingTime: number;

  private pollConnectionString: string;
  private apiConnectionString: string;

  private options: SapphireDbOptions;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  private connect() {
    if (this.connectionInformation$.value.readyState === 'disconnected') {
      this.updateConnectionInformation('connecting');

      const connectionString = `${this.pollConnectionString}/init`;

      this.httpClient.get(connectionString, {
        headers: this.headers
      }).subscribe((response: ConnectionResponse) => {
        this.headers.connectionId = response.connectionId;
        this.updateConnectionInformation('connected', response.connectionId);
        this.startPolling();
      }, (error) => {
        this.updateConnectionInformation('disconnected');

        setTimeout(() => {
          this.connect();
        }, 1000);
      });
    }

    return this.connectionInformation$.asObservable();
  }

  startPolling() {
    const load$ = new BehaviorSubject(null);

    const whenToRefresh$ = of(null).pipe(
      delay(this.pollingTime),
      tap(() => load$.next(null)),
      skip(1),
    );

    const poll$ = load$.pipe(
      concatMap(() => {
        const request$ = this.httpClient.get(this.pollConnectionString, {
          headers: this.headers
        });

        return concat(request$, whenToRefresh$);
      }),
      takeUntil(
        this.connectionInformation$.pipe(
          filter(s => s.readyState === 'disconnected')
        )
      )
    );

    poll$.subscribe((responses: ResponseBase[]) => {
      responses.forEach(response => this.messageHandler(response));
    }, (error) => {
      if (error.status === 404) {
        return;
      }

      this.updateConnectionInformation('disconnected');

      setTimeout(() => {
        this.connect();
      }, 1000);
    });
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    return this.connect().pipe(
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
    this.options = options;

    this.pollConnectionString =  `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/poll`;
    this.apiConnectionString = `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/api/`;

    this.updateConnectionInformation('disconnected');

    this.pollingTime = options.pollingTime;

    this.headers = {
      key: options.apiKey ? options.apiKey : '',
      secret: options.apiSecret ? options.apiSecret : '',
    };

    if (!!authToken) {
      this.headers.Authorization = `Bearer ${authToken}`;
    }

    this.connect();
  }
}
