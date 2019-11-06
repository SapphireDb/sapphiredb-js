import {Inject, Injectable, NgZone} from '@angular/core';
import {RealtimeDatabaseOptions} from '../models/realtime-database-options';
import {LocalstoragePaths} from '../helper/localstorage-paths';
import {ConnectionBase} from './connection-base';
import {CommandBase} from '../models/command/command-base';
import {CommandReferences} from '../models/command-references';
import {UnsubscribeCommand} from '../models/command/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../models/command/unsubscribe-message-command';
import {UnsubscribeUsersCommand} from '../models/command/unsubscribe-users-command';
import {UnsubscribeRolesCommand} from '../models/command/unsubscribe-roles-command';
import {SubscribeCommand} from '../models/command/subscribe-command';
import {SubscribeMessageCommand} from '../models/command/subscribe-message-command';
import {SubscribeUsersCommand} from '../models/command/subscribe-users-command';
import {SubscribeRolesCommand} from '../models/command/subscribe-roles-command';
import {BehaviorSubject, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {ResponseBase} from '../models/response/response-base';
import {finalize} from 'rxjs/operators';
import {GuidHelper} from '../helper/guid-helper';
import {MessageResponse} from '../models/response/message-response';
import {ConnectionResponse} from '../models/response/connection-response';
import {WebsocketConnection} from './websocket-connection';
import {SseConnection} from './sse-connection';
import {HttpClient} from '@angular/common/http';
import {ConnectionState} from '../models/types';

interface SubscribeCommandInfo extends CommandBase {
  sendWithBearer: boolean;
}

@Injectable()
export class ConnectionManagerService {
  private bearer: string;

  private connection: ConnectionBase;

  private storedCommandStorage: SubscribeCommandInfo[] = [];

  private commandReferences: CommandReferences  = {};
  private serverMessageHandler: CommandReferences = {};

  public connectionData$: BehaviorSubject<ConnectionResponse>;
  public status$: BehaviorSubject<ConnectionState>;

  constructor(@Inject('realtimedatabase.options') private options: RealtimeDatabaseOptions,
              private httpClient: HttpClient,
              private ngZone: NgZone) {
    this.connectionData$ = new BehaviorSubject<ConnectionResponse>(null);

    const authData = localStorage.getItem(LocalstoragePaths.authPath);

    if (authData) {
      this.bearer = JSON.parse(authData).authToken;
    } else {
      this.bearer = localStorage.getItem(LocalstoragePaths.bearerPath);
    }

    if (this.options.serverBaseUrl == null) {
      this.options.serverBaseUrl = window.location.host;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    if (!this.options.connectionType) {
      if (!!window['EventSource']) {
        this.options.connectionType = 'sse';
      } else {
        this.options.connectionType = 'websocket';
      }
    }

    switch (this.options.connectionType) {
      case 'websocket':
        this.connection = new WebsocketConnection();
        break;
      case 'sse':
        this.connection = new SseConnection(this.httpClient, this.ngZone);
        break;
    }

    if (this.connection) {
      this.connection.openHandler = () => {
        this.storedCommandStorage.forEach(cmd => {
          if (!cmd.sendWithBearer || !!this.bearer) {
            const sendSubscription: Subscription = this.connection.send(cmd, true);
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

      this.connection.bearer = this.bearer;
      this.connection.options = this.options;
      this.connection.dataUpdated();
    }
  }

  private storeSubscribeCommands(command: CommandBase): boolean {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand
      || command instanceof UnsubscribeUsersCommand || command instanceof UnsubscribeRolesCommand) {
      this.storedCommandStorage = this.storedCommandStorage.filter(cs => cs.referenceId !== command.referenceId);
      return true;
    } else if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand
      || command instanceof SubscribeUsersCommand || command instanceof SubscribeRolesCommand) {
      if (this.storedCommandStorage.findIndex(c => c.referenceId === command.referenceId) === -1) {
        this.storedCommandStorage.push({
          ...command,
          sendWithBearer: !!this.bearer
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
      this.commandReferences[command.referenceId] = { subject$: referenceSubject, keep: keep};
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

  public setBearer(bearer?: string) {
    this.connectionData$.next(null);
    this.bearer = bearer;

    if (bearer) {
      if (!localStorage.getItem(LocalstoragePaths.authPath)) {
        localStorage.setItem(LocalstoragePaths.bearerPath, bearer);
      }
    } else {
      localStorage.removeItem(LocalstoragePaths.bearerPath);
    }

    this.connection.bearer = this.bearer;
    this.connection.options = this.options;

    this.connection.dataUpdated();
  }

  public reset() {
    this.storedCommandStorage = [];
    this.connection.dataUpdated();
  }
}
