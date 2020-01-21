import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ConnectionBase} from './connection-base';
import {CommandBase} from '../command/command-base';
import {CommandReferences} from '../models/command-references';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../command/unsubscribe-message/unsubscribe-message-command';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {SubscribeMessageCommand} from '../command/subscribe-message/subscribe-message-command';
import {from, Observable, of, ReplaySubject} from 'rxjs';
import {ResponseBase} from '../command/response-base';
import {catchError, filter, finalize, map, share, shareReplay, take} from 'rxjs/operators';
import {GuidHelper} from '../helper/guid-helper';
import {MessageResponse} from '../command/message/message-response';
import {WebsocketConnection} from './websocket-connection';
import {SseConnection} from './sse-connection';
import {PollConnection} from './poll-connection';
import {AuthTokenState, ConnectionState} from '../models/types';
import {SubscribeCommandInfo} from '../models/subscribe-command-info';
import {AxiosResponse, default as axios} from 'axios';

export class ConnectionManager {
  private authToken?: string;
  public connection: ConnectionBase;

  private storedCommandStorage: SubscribeCommandInfo[] = [];

  private commandReferences: CommandReferences = {};
  private serverMessageHandler: CommandReferences = {};

  constructor(private options: SapphireDbOptions, private responseActionInterceptor: (executeCode: () => void) => void) {
    if (this.options.connectionType === 'sse' && typeof EventSource !== 'undefined') {
      this.connection = new SseConnection();
    } else if (this.options.connectionType === 'websocket' && typeof WebSocket !== 'undefined') {
      this.connection = new WebsocketConnection();
    } else if (this.options.connectionType === 'poll') {
      this.connection = new PollConnection();
    } else {
      if (typeof WebSocket !== 'undefined') {
        this.connection = new WebsocketConnection();
      } else {
        this.connection = new PollConnection();
      }
    }

    if (this.connection) {
      this.connection.connectionInformation$.pipe(
        filter((connectionInformation) => connectionInformation.readyState === ConnectionState.connected)
      ).subscribe(() => {
        this.responseActionInterceptor(() => {
          this.storedCommandStorage.forEach(cmd => {
            if (!cmd.sendWithAuthToken || !!this.authToken) {
              this.connection.send(cmd.command, true);
            }
          });
        });
      });

      this.connection.messageHandler = (message) => {
        this.responseActionInterceptor(() => {
          this.handleResponse(message);
        });
      };

      this.connection.setData(this.options);
    }
  }

  private storeSubscribeCommands(command: CommandBase): boolean {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand) {
      this.storedCommandStorage = this.storedCommandStorage.filter(cs => cs.command.referenceId !== command.referenceId);
      return true;
    }

    if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand) {
      if (this.storedCommandStorage.findIndex(c => c.command.referenceId === command.referenceId) === -1) {
        this.storedCommandStorage.push({
          command: command,
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
    if (!storedCommand || this.connection.connectionInformation$.value.readyState === ConnectionState.connected) {
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

  public setAuthToken(authToken?: string): Observable<AuthTokenState> {
    if (!!authToken) {
      const authTokenResult$ = this.validateAuthToken$(authToken);

      authTokenResult$.pipe(take(1)).subscribe(result => {
        if (result === AuthTokenState.valid) {
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

    return of(AuthTokenState.valid);
  }

  public reset() {
    this.storedCommandStorage = [];
    this.connection.setData(this.options, null);
  }

  private validateAuthToken$(authToken: string): Observable<AuthTokenState> {
    const checkAuthTokenUrl = `${this.options.useSsl ? 'https' : 'http'}://${this.options.serverBaseUrl}/sapphire/authToken`;

    return from(axios.post(checkAuthTokenUrl, null, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })).pipe(
      map((response: AxiosResponse<boolean>) => response.data),
      map((authTokenValid: boolean) => authTokenValid ? AuthTokenState.valid : AuthTokenState.invalid),
      catchError(error => {
        if (error.status === 401) {
          return of(AuthTokenState.invalid);
        }

        return of(AuthTokenState.error);
      }),
      shareReplay()
    );
  }
}
