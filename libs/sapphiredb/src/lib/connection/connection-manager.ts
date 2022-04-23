import {SapphireDbOptions} from '../models/sapphire-db-options';
import {CommandBase} from '../command/command-base';
import {CommandReferences} from '../models/command-references';
import {UnsubscribeCommand} from '../command/unsubscribe/unsubscribe-command';
import {UnsubscribeMessageCommand} from '../command/unsubscribe-message/unsubscribe-message-command';
import {SubscribeCommand} from '../command/subscribe/subscribe-command';
import {SubscribeMessageCommand} from '../command/subscribe-message/subscribe-message-command';
import {
  asapScheduler,
  BehaviorSubject,
  bufferCount,
  filter,
  finalize,
  map,
  Observable,
  of,
  ReplaySubject,
  share,
  Subject,
  Subscription,
  switchMap,
  take
} from 'rxjs';
import {ResponseBase} from '../command/response-base';
import {MessageResponse} from '../command/message/message-response';
import {SubscribeCommandInfo} from '../models/subscribe-command-info';
import {SubscribeQueryCommand} from '../command/subscribe-query/subscribe-query-command';
import {HubConnection, HubConnectionState} from '@microsoft/signalr';
import {createSignalRConnection$} from './signal-r-connection';

// TODO: split into multiple files -> command handler, message handler?
export class ConnectionManager {

  private authToken$ = new BehaviorSubject<string | undefined>(undefined);
  private signalRConnection$: Observable<HubConnection>;
  public online$: Observable<boolean>;

  private commandReferences: CommandReferences = {};
  private storedCommandStorage: SubscribeCommandInfo[] = [];

  public serverMessageHandler = new ReplaySubject<MessageResponse>(1);

  private connectionSubscription: Subscription;
  private storedCommandsConnectionSubscription: Subscription;
  private cleanupCommandsConnectionSubscription: Subscription;

  constructor(private options: SapphireDbOptions, private responseActionInterceptor: (executeCode: () => void) => void, private startupToken?: string) {
    this.authToken$.next(this.startupToken);

    this.signalRConnection$ = createSignalRConnection$(this.authToken$, this.options, (response) => {
      this.responseActionInterceptor(() => {
        this.handleResponse(response);
      })
    });

    this.online$ = this.signalRConnection$.pipe(
      map(connection => connection.state === HubConnectionState.Connected)
    );

    this.connectionSubscription = this.signalRConnection$.subscribe();

    // TODO: check if auth token check is useful

    this.storedCommandsConnectionSubscription = this.signalRConnection$.pipe(
      filter(connection => connection.state === HubConnectionState.Connected),
    ).subscribe((connection) => {
      this.storedCommandStorage.forEach(cmd => {
        if (!cmd.sendWithAuthToken || !!this.authToken$.getValue()) {
          connection.send('ClientMessage', cmd.command);
        }
      });
    });

    this.cleanupCommandsConnectionSubscription = this.signalRConnection$.pipe(
      map(connection => connection.state),
      bufferCount(2, 1),
      // Connection lost and trying to reconnect
      filter(([stateA, stateB]) => stateA === HubConnectionState.Connected && stateB === HubConnectionState.Reconnecting)
    ).subscribe(() => {
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
    });
  }

  public sendCommand<TResponse extends ResponseBase>(command: CommandBase, keep?: boolean, onlySend?: boolean): Observable<TResponse> {
    let referenceSubject: ReplaySubject<TResponse>;

    const storedCommand = this.storeSubscribeCommands(command);

    let connection$: Observable<HubConnection>;

    if (storedCommand) {
      connection$ = this.signalRConnection$.pipe(
        take(1)
      );
    } else {
      connection$ = this.signalRConnection$.pipe(
        filter(connection => connection.state === HubConnectionState.Connected),
        take(1)
      );
    }

    const sourceObservable$ = connection$.pipe(
      switchMap(connection => {
        if (connection.state === HubConnectionState.Connected) {
          connection.send('ClientMessage', command);
        }

        if (onlySend) {
          return of(null);
        }

        referenceSubject = new ReplaySubject<TResponse>(1);

        this.commandReferences[command.referenceId] = {
          subject$: referenceSubject as unknown as Subject<ResponseBase>,
          keep: keep
        };

        return referenceSubject;
      }),
    );

    const hotSubject$ = new ReplaySubject<TResponse | null>(1);

    sourceObservable$.subscribe(result => {
      hotSubject$.next(result);
    }, error => {
      hotSubject$.error(error);
    });

    return hotSubject$.pipe(
      finalize(() => {
        try {
          referenceSubject.complete();
          referenceSubject.unsubscribe();
        } catch (ignored) {
          // Ignored. Throws unwanted exception when no subscriber
        }

        delete this.commandReferences[command.referenceId];

        asapScheduler.schedule(() => {
          try {
            hotSubject$.complete();
            hotSubject$.unsubscribe();
          } catch (ignored) {
            // Ignored. Throws unwanted exception when no subscriber
          }
        });
      }),
      share()
    ) as unknown as Observable<TResponse>;
  }

  public setAuthToken(authToken?: string): void {
    this.authToken$.next(authToken);
  }

  public reset() {
    this.storedCommandStorage = [];
    this.setAuthToken(undefined);
  }

  public getConnectionId(): string | undefined {
    // TODO: check if removable
    return undefined;
  }

  private storeSubscribeCommands(command: CommandBase): boolean {
    if (command instanceof UnsubscribeCommand || command instanceof UnsubscribeMessageCommand) {
      this.storedCommandStorage = this.storedCommandStorage.filter(cs => cs.command.referenceId !== command.referenceId);
      return true;
    }

    if (command instanceof SubscribeCommand || command instanceof SubscribeMessageCommand || command instanceof SubscribeQueryCommand) {
      if (this.storedCommandStorage.findIndex(c => c.command.referenceId === command.referenceId) === -1) {
        this.storedCommandStorage.push({
          command: command,
          sendWithAuthToken: !!this.authToken$.getValue()
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
        if (!commandReference.keep || response.error) {
          delete this.commandReferences[response.referenceId];
        }

        if (response.error) {
          try {
            commandReference.subject$.error(response.error);
            commandReference.subject$.complete();
            commandReference.subject$.unsubscribe();
          } catch (ignored) {
            // Ignored. Throws unwanted exception when no subscriber
          }
        } else {
          commandReference.subject$.next(response);

          if (!commandReference.keep) {
            try {
              commandReference.subject$.complete();
              commandReference.subject$.unsubscribe();
            } catch (ignored) {
              // Ignored. Throws unwanted exception when no subscriber
            }
          }
        }
      }
    }
  }

  public dispose(): void {
    this.connectionSubscription?.unsubscribe();
    this.storedCommandsConnectionSubscription?.unsubscribe();
    this.cleanupCommandsConnectionSubscription?.unsubscribe();
  }
}
