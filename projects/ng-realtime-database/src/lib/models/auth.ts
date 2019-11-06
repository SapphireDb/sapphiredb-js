import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {catchError, debounce, delay, filter, map, shareReplay, skip, switchMap, take} from 'rxjs/operators';
import {LoginCommand} from './command/login-command';
import {UserData} from './user-data';
import {LoginResponse} from './response/login-response';
import {AuthData} from './auth-data';
import {RenewCommand} from './command/renew-command';
import {RenewResponse} from './response/renew-response';
import {LocalstoragePaths} from '../helper/localstorage-paths';
import {AuthInfo} from './auth-info';
import {QueryConnectionsResponse, RealtimeConnection} from './response/query-connections-response';
import {QueryConnectionsCommand} from './command/query-connections-command';
import {CloseConnectionCommand} from './command/close-connection-command';
import {CloseConnectionResponse} from './response/close-connection-response';
import {ConnectionManagerService} from '../connection/connection-manager.service';
import {ConnectionResponse} from './response/connection-response';

export class Auth {
  private authData$: BehaviorSubject<AuthData> = new BehaviorSubject(null);

  private renewPending = false;
  private renewSubject$ = new Subject<boolean>();

  /**
   * Access to auth information commands. Query and manipulate users and roles.
   */
  public info: AuthInfo;

  constructor(private connectionManagerService: ConnectionManagerService) {
    const authDataString = localStorage.getItem(LocalstoragePaths.authPath);
    if (authDataString) {
      this.authData$.next(JSON.parse(authDataString));
    }

    this.info = new AuthInfo(this.connectionManagerService);

    console.log(this);
  }

  /**
   * Get the current user data
   */
  public getUserData(): Observable<UserData> {
    return this.authData$.pipe(
      map((authData: AuthData) => {
        if (authData) {
          return authData.userData;
        }

        return null;
      })
    );
  }

  /**
   * Check if the user is logged in
   */
  public isLoggedIn(): Observable<boolean> {
    return this.isValid();
  }

  /**
   * Log the client in
   */
  public login(username: string, password: string): Observable<UserData> {
    return this.connectionManagerService.sendCommand(new LoginCommand(username, password))
      .pipe(
        map((response: LoginResponse) => {
          const newAuthData: AuthData = response;
          localStorage.setItem(LocalstoragePaths.authPath, JSON.stringify(newAuthData));
          this.authData$.next(newAuthData);
          this.connectionManagerService.setBearer(newAuthData.authToken);

          return newAuthData.userData;
        }),
        debounce(() => this.connectionManagerService.status$.pipe(filter(status => status === 'connected')))
      );
  }

  /**
   * Logout the client
   */
  public logout(): Observable<void> {
    localStorage.removeItem(LocalstoragePaths.authPath);
    this.authData$.next(null);
    this.connectionManagerService.setBearer(null);

    return this.connectionManagerService.status$.pipe(
      delay(200),
      filter(status => status === 'connected'),
      take(1),
      map(() => null)
    );
  }

  /**
   * Get current data of current connection
   */
  public getConnectionData(): Observable<ConnectionResponse> {
    return this.connectionManagerService.connectionData$.asObservable();
  }

  /**
   * Get open connectionManagerService connections for current user
   */
  public getConnections(): Observable<RealtimeConnection[]> {
    return this.connectionManagerService.sendCommand(new QueryConnectionsCommand()).pipe(map((response: QueryConnectionsResponse) => {
      return response.connections;
    }));
  }

  /**
   * Close open connectionManagerService connection of user
   */
  public closeConnection(connectionId: string, deleteRenewToken?: boolean): Observable<CloseConnectionResponse> {
    return <Observable<CloseConnectionResponse>>this.connectionManagerService.sendCommand(
      new CloseConnectionCommand(connectionId, deleteRenewToken));
  }

  private renewToken(authData: AuthData) {
    this.renewPending = true;
    this.connectionManagerService.sendCommand(new RenewCommand(authData.userData.id, authData.refreshToken))
      .pipe(
        catchError((err: any) => {
          return of(null);
        }),
        map((response: RenewResponse) => {
          if (response && !response.error) {
            const newAuthData: AuthData = response;
            this.authData$.next(newAuthData);

            localStorage.setItem(LocalstoragePaths.authPath, JSON.stringify(newAuthData));
            this.connectionManagerService.setBearer(newAuthData.authToken);
          } else {
            localStorage.removeItem(LocalstoragePaths.authPath);
            this.connectionManagerService.setBearer();
            this.authData$.next(null);
          }

          return response && !response.error;
        })
      )
      .subscribe((result: boolean) => {
        this.renewPending = false;
        this.renewSubject$.next(result);
      });
  }

  private isValid(): Observable<boolean> {
    return this.authData$.pipe(
      switchMap((authData: AuthData) => {
        return this.connectionManagerService.connectionData$.pipe(
          filter(v => !!v),
          take(1),
          map((connectionData: ConnectionResponse) => [authData, connectionData]),
        );
      }),
      switchMap(([authData, connectionData]: [AuthData, ConnectionResponse]) => {
        if (authData) {
          const expiresAt = new Date(authData.expiresAt);
          const difference = (expiresAt.getTime() - new Date().getTime()) / 1000;

          const renewFn = () => {
            if (!this.renewPending) {
              this.renewToken(authData);
            }

            return this.renewSubject$.pipe(take(1));
          };

          if (difference <= (authData.validFor / 2) || !connectionData.bearerValid) {
            return renewFn();
          } else {
            return of(true);
          }
        }

        return of(false);
      }),
      take(1)
    );
    // combineLatest([
    //   ,
    //   this.connectionManagerService.connectionData$.pipe(filter(v => !!v), take(1))
    // ])
    //   .pipe(
    //     // debounce(() => this.connectionManagerService.status$.pipe(filter(s => s === 'connected'))),
    //
    //   );
  }
}
