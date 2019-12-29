import {Inject, Injectable, NgZone} from '@angular/core';
import {SAPPHIRE_DB_OPTIONS, SapphireDbOptions} from '../../models/sapphire-db-options';
import {LocalstoragePaths} from '../../helper/localstorage-paths';
import {ConnectionBase} from '../connection-base';
import {CommandBase} from '../../command/command-base';
import {CommandReferences} from '../../models/command-references';
import {UnsubscribeCommand} from '../../command/unsubscribe/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../../command/unsubscribe-message/unsubscribe-message-command';
import {SubscribeCommand} from '../../command/subscribe/subscribe-command';
import {SubscribeMessageCommand} from '../../command/subscribe-message/subscribe-message-command';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {ResponseBase} from '../../command/response-base';
import {finalize} from 'rxjs/operators';
import {GuidHelper} from '../../helper/guid-helper';
import {MessageResponse} from '../../command/message/message-response';
import {ConnectionResponse} from '../../command/connection/connection-response';
import {WebsocketConnection} from '../websocket-connection';
import {SseConnection} from '../sse-connection';
import {HttpClient} from '@angular/common/http';
import {ConnectionState} from '../../models/types';
import {PollConnection} from '../poll-connection';

interface SubscribeCommandInfo extends CommandBase {
  sendWithAuthToken: boolean;
}

@Injectable()
export class ConnectionManagerService {
  private authToken: string;

  private connection: ConnectionBase;

  private storedCommandStorage: SubscribeCommandInfo[] = [];

  private commandReferences: CommandReferences  = {};
  private serverMessageHandler: CommandReferences = {};

  public connectionData$: BehaviorSubject<ConnectionResponse>;
  public status$: BehaviorSubject<ConnectionState>;

  constructor(@Inject(SAPPHIRE_DB_OPTIONS) private options: SapphireDbOptions,
              private httpClient: HttpClient,
              private ngZone: NgZone) {
    this.connectionData$ = new BehaviorSubject<ConnectionResponse>(null);
    this.authToken = localStorage.getItem(LocalstoragePaths.authTokenPath);

    if (this.options.serverBaseUrl == null) {
      this.options.serverBaseUrl = window.location.host;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    if (!this.options.connectionType) {
      if (!!window['EventSource']) {
        this.options.connectionType = 'sse';
      } else if (!!window['Websocket']) {
        this.options.connectionType = 'websocket';
      } else {
        this.options.connectionType = 'poll';
      }
    }

    if (!this.options.pollingTime) {
      this.options.pollingTime = 300;
    }

    switch (this.options.connectionType) {
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
      this.connection.openHandler = () => {
        this.storedCommandStorage.forEach(cmd => {
          if (!cmd.sendWithAuthToken || !!this.authToken) {
            delete cmd.sendWithAuthToken;
            this.connection.send(cmd, true);
          }
        });
      };

      this.connection.messageHandler = (message) => {
        this.handleResponse(message);
      };

      this.connection.connectionResponseHandler = (response: ConnectionResponse) => {
        this.connectionData$.next(response);
      };

      this.status$ = this.connection.readyState$;

      this.connection.authToken = this.authToken;
      this.connection.options = this.options;
      this.connection.dataUpdated();
    }
  }

  private storeSubscribeCommands(command: CommandBase): boolean {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand) {
      this.storedCommandStorage = this.storedCommandStorage.filter(cs => cs.referenceId !== command.referenceId);
      return true;
    } else if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand) {
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

  private createHotCommandObservable(referenceObservable$: Observable<ResponseBase>, command: CommandBase): Observable<ResponseBase> {
    const makeHotSubject$ = new ReplaySubject<ResponseBase>(0);
    referenceObservable$.subscribe(c => makeHotSubject$.next(c), ex => makeHotSubject$.error(ex));
    return makeHotSubject$.asObservable().pipe(finalize(() => {
      delete this.commandReferences[command.referenceId];
    }));
  }

  public sendCommand(command: CommandBase, keep?: boolean, onlySend?: boolean): Observable<ResponseBase> {
    const referenceSubject = new ReplaySubject<ResponseBase>(0);

    this.connection.send(command, this.storeSubscribeCommands(command));

    if (onlySend === true) {
      referenceSubject.complete();
      referenceSubject.unsubscribe();
      return of(null);
    } else {
      this.commandReferences[command.referenceId] = { subject$: referenceSubject, keep: keep };
      return this.createHotCommandObservable(referenceSubject, command);
    }
  }

  public registerServerMessageHandler(): Observable<ResponseBase> {
    const guid = GuidHelper.generateGuid();

    const referenceSubject = new ReplaySubject<ResponseBase>(0);
    this.serverMessageHandler[guid] = { subject$: referenceSubject, keep: true };

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
          commandReference.subject$.error(response.error);
        }

        commandReference.subject$.next(response);

        if (commandReference.keep !== true) {
          commandReference.subject$.complete();

          delete this.commandReferences[response.referenceId];
        }
      }
    }
  }

  public setAuthToken(authToken?: string) {
    this.connectionData$.next(null);
    this.authToken = authToken;

    if (authToken) {
      localStorage.setItem(LocalstoragePaths.authTokenPath, authToken);
    } else {
      localStorage.removeItem(LocalstoragePaths.authTokenPath);
    }

    this.connection.authToken = this.authToken;
    this.connection.options = this.options;

    this.connection.dataUpdated();
  }

  public reset() {
    this.storedCommandStorage = [];
    this.connection.dataUpdated();
  }
}
