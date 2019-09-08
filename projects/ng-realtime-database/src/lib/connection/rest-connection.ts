import {ConnectionBase} from './connection-base';
import {Observable, of} from 'rxjs';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../models/command/command-base';
import {ResponseBase} from '../models/response/response-base';
import {NgZone} from '@angular/core';

export class RestConnection extends ConnectionBase {
  private messageHandler: (message: ResponseBase) => void;

  private options: RealtimeDatabaseOptions;
  private bearer: string;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  connect$(connectionFailed?: boolean): Observable<boolean> {
    return of(true);
  }

  registerOnMessage(messageHandler: (message: ResponseBase) => void): void {
    this.messageHandler = messageHandler;
  }

  send(command: CommandBase, connectionId$: Observable<string>) {
    const url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/api/${command.commandType}`;

    const sendObservable$ = this.httpClient.post(url, command, {
      headers: {
        secret: this.options.secret,
        Authorization: `Bearer ${this.bearer}`
      }
    });

    sendObservable$.subscribe((response: ResponseBase) => {
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

  registerStatusListener(statusListener: (status) => void): void {
    statusListener('ready');
  }

  registerOnOpen(openHandler: () => void): void {
    openHandler();
  }

  reConnect() {}

  setData(options: RealtimeDatabaseOptions, bearer: string) {
    this.options = options;
    this.bearer = bearer;
  }
}
