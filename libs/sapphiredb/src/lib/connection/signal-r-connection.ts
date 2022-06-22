import {
  BehaviorSubject,
  bufferCount,
  distinctUntilChanged,
  finalize,
  from,
  map,
  Observable,
  of,
  publishReplay,
  refCount,
  ReplaySubject,
  retry,
  startWith,
  Subject,
  switchMap,
  timer
} from 'rxjs';
import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel, RetryContext} from '@microsoft/signalr';
import {ResponseBase} from '../command/response-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {AuthTokenHelper} from '../helper/auth-token-helper';

export function createSignalRConnection$(authToken$: BehaviorSubject<string | undefined>, options: SapphireDbOptions,
                                         handleResponse: (response: ResponseBase) => void,
                                         authTokenExpired$: Subject<string>): Observable<HubConnection> {
  const connectionEventSubject$ = new ReplaySubject<HubConnection>(1);
  let storedConnection: HubConnection | undefined;

  return authToken$.pipe(
    distinctUntilChanged(),
    map(authToken => {
      const queryParameters = [];

      if (options.clientVersion) {
        queryParameters.push(`clientVersion=${options.clientVersion}`);
      }

      if (options.apiKey && options.apiSecret) {
        queryParameters.push(`apiKey=${options.apiKey}`);
        queryParameters.push(`apiSecret=${options.apiSecret}`);
      }

      const queryParametersString = queryParameters.length > 0 ? '?' + queryParameters.join('&') : '';

      const newConnection = new HubConnectionBuilder()
        .withUrl(`${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/hub${queryParametersString}`, {
          accessTokenFactory: () => {
            if (!authToken) {
              return undefined as unknown as string;
            }

            const authTokenValid = AuthTokenHelper.tokenValid(authToken);

            if (!authTokenValid) {
              authToken$.next(undefined);
              authTokenExpired$.next(authToken);
            }

            return authTokenValid ? authToken : undefined as unknown as string;
          }
        })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null {
            return retryContext.previousRetryCount < 10 ? 1000 * retryContext.previousRetryCount : 15000;
          }
        })
        .build();

      newConnection.on('ServerMessage', (message) => {
        handleResponse(message);
      });

      // Store connection for disposing in finalize
      storedConnection = newConnection;
      return newConnection;
    }),
    startWith(undefined),
    bufferCount(2, 1),
    switchMap(([oldConnection, newConnection]) => {
      let startEvent$: Observable<null | void> = of(null);

      if (oldConnection) {
        startEvent$ = from(oldConnection.stop());
      }

      const currentConnection = newConnection as HubConnection;

      return startEvent$.pipe(
        switchMap(async () => {
          await currentConnection.start();
          return currentConnection;
        }),
        retry({
          delay: (error, count) => {
            return timer(count < 10 ? 1000 * count : 15000);
          }
        }),
        startWith(currentConnection)
      );
    }),
    switchMap(connection => {
      connectionEventSubject$.next(connection);

      if (connection.state === HubConnectionState.Disconnected) {
        connection.onreconnected(() => {
          connectionEventSubject$.next(connection);
        });

        connection.onreconnecting((error) => {
          connectionEventSubject$.next(connection);
        });
      }

      return connectionEventSubject$;
    }),
    finalize(() => {
      storedConnection?.stop();
    }),
    publishReplay(1),
    refCount()
  );
}
