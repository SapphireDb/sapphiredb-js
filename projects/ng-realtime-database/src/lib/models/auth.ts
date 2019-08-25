import {WebsocketService} from '../websocket.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {catchError, filter, map, switchMap, take} from 'rxjs/operators';
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

export class Auth {
  private authData$: BehaviorSubject<AuthData> = new BehaviorSubject(null);

  private renewPending = false;
  private renewSubject$ = new Subject<RenewResponse>();

  /**
   * Access to auth information commands. Query and manipulate users and roles.
   */
  public info: AuthInfo;

  constructor(private websocket: WebsocketService) {
    const authDataString = localStorage.getItem(LocalstoragePaths.authPath);
    if (authDataString) {
      this.authData$.next(JSON.parse(authDataString));
      this.websocket.setBearer(this.authData$.value.authToken);
    }

    this.info = new AuthInfo(this.websocket);
  }

  /**
   * Get the current user data
   */
  public getUserData(): Observable<UserData> {
    return this.isValid().pipe(switchMap((valid: boolean) => {
      if (valid) {
        return this.authData$.pipe(map((authData: AuthData) => {
          if (authData) {
            return authData.userData;
          }

          return null;
        }));
      }

      return of(null);
    }));
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
    return this.websocket.sendCommand(new LoginCommand(username, password))
      .pipe(switchMap((response: LoginResponse) => {
        const newAuthData: AuthData = response;
        this.authData$.next(newAuthData);

        localStorage.setItem(LocalstoragePaths.authPath, JSON.stringify(newAuthData));
        const userData$ = this.getUserData();

        userData$.pipe(filter(v => !!v), take(1)).subscribe(() => {
          this.websocket.setBearer(newAuthData.authToken);
        });

        return userData$;
      }));
  }

  /**
   * Logout the client
   */
  public logout() {
    localStorage.removeItem(LocalstoragePaths.authPath);
    this.authData$.next(null);
    this.websocket.setBearer(null);
  }

  /**
   * Get current connection id
   */
  public getConnectionId(): Observable<string> {
    return this.websocket.connectionId$.asObservable();
  }

  /**
   * Get open websocket connections for current user
   */
  public getConnections(): Observable<RealtimeConnection[]> {
    return this.websocket.sendCommand(new QueryConnectionsCommand()).pipe(map((response: QueryConnectionsResponse) => {
      return response.connections;
    }));
  }

  /**
   * Close open websocket connection of user
   */
  public closeConnection(connectionId: string, deleteRenewToken?: boolean): Observable<CloseConnectionResponse> {
    return <Observable<CloseConnectionResponse>>this.websocket.sendCommand(new CloseConnectionCommand(connectionId, deleteRenewToken));
  }

  private renewToken(authData: AuthData) {
    this.renewPending = true;

    this.websocket.sendCommand(new RenewCommand(authData.userData.id, authData.refreshToken))
      .pipe(catchError((err: any) => {
        return of(null);
      }))
      .subscribe((response: RenewResponse) => {
        if (response) {
          const newAuthData: AuthData = response;
          this.authData$.next(newAuthData);

          localStorage.setItem(LocalstoragePaths.authPath, JSON.stringify(newAuthData));
          this.websocket.setBearer(newAuthData.authToken);
        } else {
          localStorage.removeItem(LocalstoragePaths.authPath);
          this.websocket.setBearer();
          this.authData$.next(null);
        }

        this.renewPending = false;
        this.renewSubject$.next(response);
      });
  }

  private isValid(): Observable<boolean> {
    return this.authData$.pipe(switchMap((authData: AuthData) => {
      if (authData) {
        const expiresAt = new Date(authData.expiresAt);
        const difference = (expiresAt.getTime() - new Date().getTime()) / 1000;

        if (difference <= (authData.validFor / 2)) {
          if (!this.renewPending) {
            this.renewToken(authData);
          }

          return this.renewSubject$.pipe(
            take(1),
            map((response: RenewResponse) => {
              return !!response && response.error === null;
            })
          );
        } else {
          return of(true);
        }
      }

      return of(false);
    }));
  }
}
