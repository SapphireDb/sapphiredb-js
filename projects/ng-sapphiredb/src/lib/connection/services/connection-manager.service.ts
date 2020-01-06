import {Inject, Injectable, NgZone} from '@angular/core';
import {SAPPHIRE_DB_OPTIONS, SapphireDbOptions} from '../../models/sapphire-db-options';
import {ConnectionBase} from '../connection-base';
import {CommandBase} from '../../command/command-base';
import {CommandReferences} from '../../models/command-references';
import {UnsubscribeCommand} from '../../command/unsubscribe/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../../command/unsubscribe-message/unsubscribe-message-command';
import {SubscribeCommand} from '../../command/subscribe/subscribe-command';
import {SubscribeMessageCommand} from '../../command/subscribe-message/subscribe-message-command';
import {Observable, of, ReplaySubject} from 'rxjs';
import {ResponseBase} from '../../command/response-base';
import {catchError, delay, filter, finalize, map, share, shareReplay, take} from 'rxjs/operators';
import {GuidHelper} from '../../helper/guid-helper';
import {MessageResponse} from '../../command/message/message-response';
import {WebsocketConnection} from '../websocket-connection';
import {SseConnection} from '../sse-connection';
import {HttpClient} from '@angular/common/http';
import {PollConnection} from '../poll-connection';

interface SubscribeCommandInfo extends CommandBase {
  sendWithAuthToken: boolean;
}

@Injectable()
export class ConnectionManagerService {
  private authToken?: string;
  public connection: ConnectionBase;

  private storedCommandStorage: SubscribeCommandInfo[] = [];

  private commandReferences: CommandReferences = {};
  private serverMessageHandler: CommandReferences = {};

  constructor(@Inject(SAPPHIRE_DB_OPTIONS) private options: SapphireDbOptions,
              private httpClient: HttpClient,
              private ngZone: NgZone) {
    if (this.options.serverBaseUrl == null) {
      this.options.serverBaseUrl = window.location.host;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    if (!this.options.connectionType) {
      if (!!window['Websocket']) {
        this.options.connectionType = 'websocket';
      } else if (!!window['EventSource']) {
        this.options.connectionType = 'sse';
      } else {
        this.options.connectionType = 'poll';
      }
    }

    if (!this.options.pollingTime) {
      this.options.pollingTime = 300;
    }

    switch (this.options.connectionType) {
      default:
      case 'websocket':
        this.connection = new WebsocketConnection();
        break;
      case 'sse':
        this.connection = new SseConnection(this.httpClient, this.ngZone);
        break;
      case 'poll':
        this.connection = new PollConnection(this.httpClient, this.ngZone);
        break;
    }

    if (this.connection) {
      this.connection.connectionInformation$.pipe(
        filter((connectionInformation) => connectionInformation.readyState === 'connected')
      ).subscribe(() => {
        this.storedCommandStorage.forEach(cmd => {
          if (!cmd.sendWithAuthToken || !!this.authToken) {
            delete cmd.sendWithAuthToken;
            this.connection.send(cmd, true);
          }
        });
      });

      this.connection.messageHandler = (message) => {
        this.handleResponse(message);
      };

      this.connection.setData(this.options);
    }
  }

  private storeSubscribeCommands(command: CommandBase): boolean {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand) {
      this.storedCommandStorage = this.storedCommandStorage.filter(cs => cs.referenceId !== command.referenceId);
      return true;
    }

    if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand) {
      if (this.storedCommandStorage.findIndex(c => c.referenceId === command.referenceId) === -1) {
        this.storedCommandStorage.push({
          ...command,
          sendWithAuthToken: !!this.authToken
        });
        return true;
      }
    }

    return false;
  }

  public sendCommand(command: CommandBase, keep?: boolean, onlySend?: boolean): Observable<ResponseBase> {
    const storedCommand = this.storeSubscribeCommands(command);

    // Only send stored command if connected
    if (!storedCommand || this.connection.connectionInformation$.value.readyState === 'connected') {
      this.connection.send(command, storedCommand);
    }

    if (onlySend === true) {
      return of(null);
    }

    const referenceSubject = new ReplaySubject<ResponseBase>(1);

    this.commandReferences[command.referenceId] = {subject$: referenceSubject, keep: keep};
    return referenceSubject.asObservable().pipe(
      finalize(() => {
        referenceSubject.complete();
        referenceSubject.unsubscribe();
        delete this.commandReferences[command.referenceId];
      }),
      share()
    );
  }

  public registerServerMessageHandler(): Observable<ResponseBase> {
    const guid = GuidHelper.generateGuid();

    const referenceSubject = new ReplaySubject<ResponseBase>(1);
    this.serverMessageHandler[guid] = {subject$: referenceSubject, keep: true};

    return referenceSubject.pipe(finalize(() => {
      delete this.serverMessageHandler[guid];
    }));
  }

  private handleMessageResponse(response: MessageResponse) {
    Object.keys(this.serverMessageHandler).map(k => this.serverMessageHandler[k]).forEach(handler => {
      if (response.error) {
        handler.subject$.error(response);
      }

      handler.subject$.next(response);
    });
  }

  private handleResponse(response: ResponseBase) {
    if (response.responseType === 'WrongApiResponse') {
      throw new Error('Wrong API key or secret');
    } else if (response.responseType === 'MessageResponse') {
      this.handleMessageResponse(<MessageResponse>response);
    } else {
      const commandReference = this.commandReferences[response.referenceId];

      if (commandReference) {
        if (response.error) {
          try {
            commandReference.subject$.error(response.error);
            commandReference.subject$.complete();
            commandReference.subject$.unsubscribe();
          } catch (ignored) {
            // Ignored. Throws unwanted exception when no subscriber
          }

          delete this.commandReferences[response.referenceId];
        } else {
          commandReference.subject$.next(response);

          if (commandReference.keep !== true) {
            try {
              commandReference.subject$.complete();
              commandReference.subject$.unsubscribe();
            } catch (ignored) {
              // Ignored. Throws unwanted exception when no subscriber
            }

            delete this.commandReferences[response.referenceId];
          }
        }
      }
    }
  }

  public setAuthToken(authToken?: string): Observable<'valid'|'error'|'invalid'>|null {
    if (!!authToken) {
      const authTokenResult$ = this.validateAuthToken$(authToken);

      authTokenResult$.pipe(take(1)).subscribe(result => {
        if (result === 'valid') {
          this.authToken = authToken;
          this.connection.setData(this.options, this.authToken);
        }
      });

      return authTokenResult$;
    } else {
      if (!!this.authToken) {
        this.connection.setData(this.options);
      }
    }

    return null;
  }

  public reset() {
    this.storedCommandStorage = [];
    this.connection.setData(this.options, null);
  }

  private validateAuthToken$(authToken: string): Observable<'valid'|'error'|'invalid'> {
    const checkAuthTokenUrl = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/sapphire/authToken`;

    return <Observable<'valid'|'error'|'invalid'>>this.httpClient.post(checkAuthTokenUrl, null, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).pipe(
      map((authTokenValid: boolean) => authTokenValid ? 'valid' : 'invalid'),
      catchError(error => {
        if (error.status === 401) {
          return of('invalid');
        }

        return of('error');
      }),
      shareReplay()
    );
  }
}
