import {ConnectionResponse} from '../command/connection/connection-response';
import {BehaviorSubject, concat, from, of, Subscription} from 'rxjs';
import {ConnectionState} from '../models/types';
import {ResponseBase} from '../command/response-base';
import {CommandBase} from '../command/command-base';
import {concatMap, filter, map, skip, take, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {ConnectionBase} from './connection-base';
import {SapphireDbOptions} from '../models/sapphire-db-options';
import {AxiosError, AxiosResponse, default as axios} from 'axios';

export class PollConnection extends ConnectionBase {
  private headers: { key: string, secret: string, Authorization?: string, connectionId?: string };

  private pollConnectionString: string;
  private apiConnectionString: string;

  private options: SapphireDbOptions;

  constructor() {
    super();
  }

  private connect() {
    if (this.connectionInformation$.value.readyState === ConnectionState.disconnected) {
      this.updateConnectionInformation(ConnectionState.connecting);

      this.checkAuthToken().pipe(take(1)).subscribe(() => {
        const connectionString = `${this.pollConnectionString}/init`;

        axios.get(connectionString, {
          headers: this.headers
        }).then((axiosResponse: AxiosResponse<ConnectionResponse>) => {
          this.headers.connectionId = axiosResponse.data.connectionId;
          this.updateConnectionInformation(ConnectionState.connected, axiosResponse.data.connectionId);
          this.startPolling();
        }, (error) => {
          this.updateConnectionInformation(ConnectionState.disconnected);

          setTimeout(() => {
            this.connect();
          }, 1000);
        });
      });
    }

    return this.connectionInformation$.asObservable();
  }

  startPolling() {
    const load$ = new BehaviorSubject(null);

    const whenToRefresh$ = of(null).pipe(
      tap(() => load$.next(null)),
      skip(1),
    );

    const poll$ = load$.pipe(
      concatMap(() => {
        const request$ = from(axios.get(this.pollConnectionString, {
          headers: this.headers
        })).pipe(
          map((response: AxiosResponse<ResponseBase[]>) => response && response.data)
        );

        return concat(request$, whenToRefresh$);
      }),
      takeUntil(
        this.connectionInformation$.pipe(
          filter(s => s.readyState === ConnectionState.disconnected)
        )
      )
    );

    poll$.subscribe((responses: ResponseBase[]) => {
      if (responses) {
        responses.forEach(response => this.messageHandler(response));
      } else {
        this.updateConnectionInformation(ConnectionState.disconnected);

        setTimeout(() => {
          this.connect();
        }, 1000);
      }
    }, (error) => {
      this.updateConnectionInformation(ConnectionState.disconnected);

      setTimeout(() => {
        this.connect();
      }, 1000);
    });
  }

  send(object: CommandBase, storedCommand: boolean): Subscription {
    return this.connectionInformation$.pipe(
      takeWhile((connectionInformation) => connectionInformation.readyState !== ConnectionState.disconnected || !storedCommand),
      filter((connectionInformation) => connectionInformation.readyState === ConnectionState.connected),
      take(1)
    ).subscribe(() => {
      this.makePost(object);
    });
  }

  private makePost(command: CommandBase) {
    const url = `${this.apiConnectionString}${command.commandType}`;

    axios.post(url, command, {
      headers: this.headers,
    }).then((axiosResponse: AxiosResponse<ResponseBase>) => {
      if (!!axiosResponse.data) {
        this.messageHandler(axiosResponse.data);
      }
    }).catch((error: AxiosError<ResponseBase>) => {
      if (error.response) {
        this.messageHandler(error.response.data);
      }
    });
  }

  setData(options: SapphireDbOptions, authToken?: string) {
    this.options = options;

    this.pollConnectionString =  `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/poll`;
    this.apiConnectionString = `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/api/`;

    this.updateConnectionInformation(ConnectionState.disconnected);

    this.headers = {
      key: options.apiKey ? options.apiKey : '',
      secret: options.apiSecret ? options.apiSecret : '',
    };

    if (!!authToken) {
      this.headers.Authorization = `Bearer ${authToken}`;
    }

    this.connect();
  }
}
