import {SapphireDbOptions} from '../models/sapphire-db-options';
import {ConnectionBase} from './connection-base';
import {CommandBase} from '../command/command-base';
import {CommandReferences} from '../models/command-references';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../command/unsubscribe-message/unsubscribe-message-command';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {SubscribeMessageCommand} from '../command/subscribe-message/subscribe-message-command';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {ResponseBase} from '../command/response-base';
import {filter, finalize, share, switchMap, take} from 'rxjs/operators';
import {MessageResponse} from '../command/message/message-response';
import {WebsocketConnection} from './websocket-connection';
import {SseConnection} from './sse-connection';
import {PollConnection} from './poll-connection';
import {AuthTokenState, ConnectionState} from '../models/types';
import {SubscribeCommandInfo} from '../models/subscribe-command-info';
import {AuthTokenHelper} from '../helper/auth-token-helper';

export class ConnectionManager {
  public connection: ConnectionBase;
  public serverMessageHandler = new ReplaySubject<MessageResponse>(1);
  public authTokenState$ = new BehaviorSubject<AuthTokenState>(AuthTokenState.not_set);
  private authToken?: string;
  private storedCommandStorage: SubscribeCommandInfo[] = [];
  private commandReferences: CommandReferences = {};

  constructor(private options: SapphireDbOptions, private responseActionInterceptor: (executeCode: () => void) => void, private startupToken: string) {
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
      this.connection.connectionInformation$.subscribe((connectionInformation) => {
        if (connectionInformation.readyState === ConnectionState.connected) {
          this.responseActionInterceptor(() => {
            this.storedCommandStorage.forEach(cmd => {
              if (!cmd.sendWithAuthToken || !!this.authToken) {
                this.connection.send(cmd.command, true);
              }
            });
          });
        }

        if (connectionInformation.readyState === ConnectionState.disconnected) {
          Object.keys(this.commandReferences).forEach(key => {
            if (!this.storedCommandStorage.find(command => command.command.referenceId === key)) {
              const commandReference = this.commandReferences[key];

              try {
                commandReference.subject$.error('Connection lost during execution');
                commandReference.subject$.complete();
                commandReference.subject$.unsubscribe();
              } catch (ignored) {
                // Ignored. Throws unwanted exception when no subscriber
              }

              delete this.commandReferences[key];
            }
          });
        }
      });

      this.connection.messageHandler = (message) => {
        this.responseActionInterceptor(() => {
          this.handleResponse(message);
        });
      };

      if (this.startupToken) {
        this.authTokenState$.next(AuthTokenState.validating);
        AuthTokenHelper.validateAuthToken$(this.startupToken, this.options).pipe(take(1)).subscribe((result) => {
          if (result === AuthTokenState.valid) {
            this.connection.setData(this.options, this.startupToken);
            this.authTokenState$.next(AuthTokenState.valid);
          } else {
            this.connection.setData(this.options);
            this.authTokenState$.next(AuthTokenState.not_set);
          }
        });
      } else {
        this.connection.setData(this.options, this.startupToken);
      }
    }
  }

  public sendCommand(command: CommandBase, keep?: boolean, onlySend?: boolean): Observable<ResponseBase> {
    return this.authTokenState$.pipe(
      filter(authTokenState => authTokenState !== AuthTokenState.validating),
      take(1),
      switchMap(() => {
        const storedCommand = this.storeSubscribeCommands(command);

        // Only try to send stored command if connected, because all commands are cached until they are sent
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
      })
    );
  }

  public setAuthToken(authToken?: string): Observable<AuthTokenState> {
    if (!!authToken) {
      this.authTokenState$.next(AuthTokenState.validating);

      const authTokenResult$ = AuthTokenHelper.validateAuthToken$(authToken, this.options);

      authTokenResult$.pipe(
        take(1)
      ).subscribe(result => {
        if (result === AuthTokenState.valid) {
          this.authToken = authToken;
          this.connection.setData(this.options, this.authToken);
          this.authTokenState$.next(AuthTokenState.valid);
        } else {
          if (!!this.authToken) {
            this.connection.setData(this.options);
            this.authTokenState$.next(AuthTokenState.not_set);
          }
        }
      });

      return authTokenResult$;
    } else {
      if (!!this.authToken) {
        this.connection.setData(this.options);
        this.authTokenState$.next(AuthTokenState.not_set);
      }
    }

    return this.authTokenState$.asObservable();
  }

  public reset() {
    this.storedCommandStorage = [];
    this.connection.setData(this.options, null);
  }

  public getConnectionId(): string | null {
    return this.connection.connectionInformation$.value.connectionId;
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

  private handleMessageResponse(response: MessageResponse) {
    if (response.error) {
      this.serverMessageHandler.error(response);
    }

    this.serverMessageHandler.next(response);
  }

  private handleResponse(response: ResponseBase) {
    if (response.responseType === 'WrongApiResponse') {
      throw new Error('Wrong api key or secret');
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
}
