import {Inject, Injectable} from '@angular/core';
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
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {ResponseBase} from '../models/response/response-base';
import {finalize, shareReplay, switchMap, take} from 'rxjs/operators';
import {GuidHelper} from '../helper/guid-helper';
import {MessageResponse} from '../models/response/message-response';
import {ConnectionResponse} from '../models/response/connection-response';

@Injectable()
export class ConnectionManagerService {
  private bearer: string;

  private connection: ConnectionBase;

  private unsendCommandStorage: CommandBase[] = [];

  private commandReferences: CommandReferences  = {};
  private serverMessageHandler: CommandReferences = {};

  public connectionId$: BehaviorSubject<string>;
  public status$: BehaviorSubject<'connecting'|'disconnected'|'ready'> =
    new BehaviorSubject<'connecting'|'disconnected'|'ready'>('disconnected');

  constructor(@Inject('realtimedatabase.options') private options: RealtimeDatabaseOptions) {
    const authData = localStorage.getItem(LocalstoragePaths.authPath);

    if (authData) {
      this.bearer = JSON.parse(authData).authToken;
    } else {
      this.bearer = localStorage.getItem(LocalstoragePaths.bearerPath);
    }
  }

  private storeSubscribeCommands(command: CommandBase) {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand
      || command instanceof UnsubscribeUsersCommand || command instanceof UnsubscribeRolesCommand) {
      this.unsendCommandStorage = this.unsendCommandStorage.filter(cs => cs.referenceId !== command.referenceId);
    } else if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand
      || command instanceof SubscribeUsersCommand || command instanceof SubscribeRolesCommand) {
      if (this.unsendCommandStorage.findIndex(c => c.referenceId === command.referenceId) === -1) {
        this.unsendCommandStorage.push(command);
      }
    }
  }

  private createHotCommandObservable(referenceObservable$: Observable<ResponseBase>, command: CommandBase): Observable<ResponseBase> {
    const makeHotSubject$ = new Subject<ResponseBase>();
    referenceObservable$.subscribe(c => makeHotSubject$.next(c), ex => makeHotSubject$.error(ex));
    return makeHotSubject$.asObservable().pipe(finalize(() => {
      delete this.commandReferences[command.referenceId];
    }));
  }

  public sendCommand(command: CommandBase, keep?: boolean, onlySend?: boolean): Observable<ResponseBase> {
    const referenceObservable$ = this.connectToWebsocket().pipe(take(1), switchMap((v) => {
      const referenceSubject = new Subject<ResponseBase>();
      this.commandReferences[command.referenceId] = { subject$: referenceSubject, keep: keep};
      this.socket.send(JSON.stringify(command));
      this.storeSubscribeCommands(command);

      if (onlySend === true) {
        referenceSubject.complete();
        referenceSubject.unsubscribe();
        delete this.commandReferences[command.referenceId];

        return of(null);
      } else {
        return referenceSubject;
      }
    })).pipe(shareReplay());

    return this.createHotCommandObservable(referenceObservable$, command);
  }

  public registerServerMessageHandler(): Observable<ResponseBase> {
    const guid = GuidHelper.generateGuid();

    const referenceSubject = new Subject<ResponseBase>();
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
    if (response.responseType === 'MessageResponse') {
      this.handleMessageResponse(<MessageResponse>response);
    } else if (response.responseType === 'ConnectionResponse') {
      this.connectionId$.next((<ConnectionResponse>response).connectionId);
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
    if (bearer) {
      this.bearer = bearer;

      if (!localStorage.getItem(LocalstoragePaths.authPath)) {
        localStorage.setItem(LocalstoragePaths.bearerPath, bearer);
      }
    } else {
      localStorage.removeItem(LocalstoragePaths.bearerPath);
    }

    if (this.socket) {
      this.socket.onclose = () => {};
      this.socket.close();
    }

    setTimeout(() => {
      this.connectToWebsocket();
    }, 10);
  }

  private createConnectionString(): string {
    if (this.options.serverBaseUrl == null) {
      this.options.serverBaseUrl = window.location.host;
      this.options.useSsl = window.location.protocol === 'https:';
    }

    let url = '';

    if (this.options.connectionType === 'websocket') {
      url += this.options.useSsl ? 'wss' : 'ws';
    } else {
      url += this.options.useSsl ? 'https' : 'http';
    }

    url += `://${this.options.serverBaseUrl}/realtimedatabase/`;

    if (this.options.connectionType === 'websocket') {
      url += 'socket';
    } else if (this.options.connectionType === 'sse') {
      url += 'sse';
    } else {
      url += 'api';
    }

    url += '?';

    if (this.options.secret) {
      url += `secret=${this.options.secret}&`;
    }

    if (this.bearer) {
      url += `bearer=${this.bearer}`;
    }

    return url;
  }
}
