import {ConnectionBase} from './connection-base';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {CommandBase} from '../models/command/command-base';
import {ResponseBase} from '../models/response/response-base';
import {NgZone} from '@angular/core';
import {ConnectionState} from '../models/types';
import {ConnectionResponse} from '../models/response/connection-response';

export class SseConnection extends ConnectionBase {
  private eventSource: EventSource;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) {
    super();
  }

  connect$(): Observable<ConnectionState> {
    if (this.readyState$.value === 'disconnected') {
      this.readyState$.next('connecting');

      const connectionString = this.createConnectionString();
      this.eventSource = new EventSource(connectionString);

      // if (this.connectionString === connectionString && !connectionFailed) {
      //   if (this.connectSubject$ && !this.connectSubject$.closed) {
      //     return this.connectSubject$.asObservable();
      //   } else if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
      //     return of(true);
      //   }
      // }

      // if (!connectionFailed && !this.connectSubject$) {
      //   this.connectSubject$ = new BehaviorSubject<boolean>(false);
      //   this.statusListener('connecting');
      // }

      this.eventSource.onopen = () => {

      };

      this.eventSource.onmessage = (messageEvent) => {
        this.ngZone.run(() => {
          const message: ResponseBase = JSON.parse(messageEvent.data);

          if (message.responseType === 'ConnectionResponse') {
            this.connectionResponseHandler(<ConnectionResponse>message);
            this.openHandler();
            this.readyState$.next('connected');
          } else {
            this.messageHandler(message);
          }
        });
      };

      this.eventSource.onerror = () => {
        this.ngZone.run(() => {
          this.readyState$.next('disconnected');

          // setTimeout(() => {
          //   this.statusListener('connecting');
          //   this.connect$(true);
          // }, 1000);
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
      console.log(object);
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {

  }

  // send(command: CommandBase, connectionId$: Observable<string>) {
  //   const sendCommand =
  //     () => connectionId$.pipe(filter(v => !!v), take(1), switchMap((connectionId: string) => {
  //       const url = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/realtimedatabase/api/${command.commandType}`;
  //
  //       return this.httpClient.post(url, command, {
  //         headers: {
  //           secret: this.options.secret,
  //           connectionId: connectionId,
  //           Authorization: `Bearer ${this.bearer}`
  //         }
  //       });
  //     }));
  //
  //   let sendObservable$: Observable<any>;
  //
  //   if (this.connectSubject$) {
  //     sendObservable$ = this.connectSubject$.pipe(filter(v => !!v), take(1)).pipe(switchMap(() => {
  //       return sendCommand();
  //     }));
  //   } else {
  //     sendObservable$ = sendCommand();
  //   }
  //
  //   sendObservable$.subscribe((response: ResponseBase) => {
  //     if (!!response) {
  //       this.ngZone.run(() => {
  //         this.messageHandler(response);
  //       });
  //     }
  //   }, (error: HttpErrorResponse) => {
  //     if (!!error) {
  //       this.ngZone.run(() => {
  //         this.messageHandler(error.error);
  //       });
  //     }
  //   });
  // }

  // reConnect$() {
  //   if (this.eventSource) {
  //     this.eventSource.close();
  //   }
  //
  //   return this.connect$();
  // }

  dataUpdated() {
    console.log('test123');

    setTimeout(() => {
      this.connect$();
    }, 10);
    // this.eventSource.close();
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
