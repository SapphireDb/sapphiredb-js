import {ConnectionBase} from './connection-base';
import {Observable, of} from 'rxjs';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../models/command/command-base';
import {ResponseBase} from '../models/response/response-base';
import {NgZone} from '@angular/core';

export class RestConnection extends ConnectionBase {
  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  send(command: CommandBase) {
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

    return true;
  }

  dataUpdated() {
  }
}
