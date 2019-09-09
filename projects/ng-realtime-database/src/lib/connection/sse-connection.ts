import {ConnectionBase} from './connection-base';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommandBase} from '../models/command/command-base';
import {ResponseBase} from '../models/response/response-base';
import {NgZone} from '@angular/core';

export class SseConnection extends ConnectionBase {
  private connectionString: string;

  private eventSource: EventSource;
  private connectSubject$: BehaviorSubject<boolean>;

  private openHandler: () => void;
  private messageHandler: (message: ResponseBase) => void;
  private statusListener: (status) => void;

  private options: RealtimeDatabaseOptions;
  private bearer: string;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  connect$(connectionFailed?: boolean): Observable<boolean> {
    const connectionString = this.createConnectionString();

    if (this.connectionString === connectionString && !connectionFailed) {
      if (this.connectSubject$ && !this.connectSubject$.closed) {
        return this.connectSubject$.asObservable();
      } else if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
        return of(true);
      }
    }

    this.connectionString = connectionString;
    this.eventSource = new EventSource(this.connectionString);

    if (!connectionFailed && !this.connectSubject$) {
      this.connectSubject$ = new BehaviorSubject<boolean>(false);
      this.statusListener('connecting');
    }

    this.eventSource.onmessage = (messageEvent) => {
      this.ngZone.run(() => {
        this.messageHandler(JSON.parse(messageEvent.data));
      });
    };

    this.eventSource.onopen = () => {
      const waitCommand = () => {
        if (this.eventSource.readyState !== EventSource.OPEN) {
          setTimeout(waitCommand, 10);
          return;
        }

        this.ngZone.run(() => {
          this.openHandler();
          this.statusListener('ready');

          if (this.connectSubject$) {
            this.connectSubject$.next(true);
            this.connectSubject$.complete();
            this.connectSubject$ = null;
          }
        });
      };

      waitCommand();
    };

    this.eventSource.onerror = () => {
      this.ngZone.run(() => {
        this.bearer = null;
        this.statusListener('disconnected');

        setTimeout(() => {
          this.statusListener('connecting');
          this.connect$(true);
        }, 1000);
      });
    };

    return this.connectSubject$.asObservable();
  }

  registerOnMessage(messageHandler: (message: ResponseBase) => void): void {
    this.messageHandler = messageHandler;
  }

  send(command: CommandBase, connectionId$: Observable<string>) {
    const sendCommand =
      () => connectionId$.pipe(filter(v => !!v), take(1), switchMap((connectionId: string) => {
        const url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/api/${command.commandType}`;

        return this.httpClient.post(url, command, {
          headers: {
            secret: this.options.secret,
            connectionId: connectionId,
            Authorization: `Bearer ${this.bearer}`
          }
        });
      }));

    let sendObservable$: Observable<any>;

    if (this.connectSubject$) {
      sendObservable$ = this.connectSubject$.pipe(filter(v => !!v), take(1)).pipe(switchMap(() => {
        return sendCommand();
      }));
    } else {
      sendObservable$ = sendCommand();
    }

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
    this.statusListener = statusListener;
  }

  registerOnOpen(openHandler: () => void): void {
    this.openHandler = openHandler;
  }

  reConnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.connect$();
  }

  setData(options: RealtimeDatabaseOptions, bearer: string) {
    this.options = options;
    this.bearer = bearer;
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
