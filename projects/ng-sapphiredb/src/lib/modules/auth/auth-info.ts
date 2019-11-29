import {AuthSubscriptionReference} from './auth-subscription-reference';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserData} from './user-data';
import {SubscribeUsersCommand} from '../../command/subscribe-users/subscribe-users-command';
import {SubscribeUsersResponse} from '../../command/subscribe-users/subscribe-users-response';
import {finalize, map} from 'rxjs/operators';
import {CreateUserResponse} from '../../command/create-user/create-user-response';
import {CreateUserCommand} from '../../command/create-user/create-user-command';
import {UpdateUserResponse} from '../../command/update-user/update-user-response';
import {UpdateUserCommand} from '../../command/update-user/update-user-command';
import {DeleteUserResponse} from '../../command/delete-user/delete-user-response';
import {DeleteUserCommand} from '../../command/delete-user/delete-user-command';
import {RoleData} from './role-data';
import {SubscribeRolesCommand} from '../../command/subscribe-roles/subscribe-roles-command';
import {SubscribeRolesResponse} from '../../command/subscribe-roles/subscribe-roles-response';
import {UnsubscribeRolesCommand} from '../../command/unsubscribe-roles/unsubscribe-roles-command';
import {CreateRoleResponse} from '../../command/create-role/create-role-response';
import {CreateRoleCommand} from '../../command/create-role/create-role-command';
import {UpdateRoleResponse} from '../../command/update-role/update-role-response';
import {UpdateRoleCommand} from '../../command/update-role/update-role-command';
import {DeleteRoleResponse} from '../../command/delete-role/delete-role-response';
import {DeleteRoleCommand} from '../../command/delete-role/delete-role-command';
import {UnsubscribeUsersCommand} from '../../command/unsubscribe-users/unsubscribe-users-command';
import {ConnectionManagerService} from '../../connection/services/connection-manager.service';

export class AuthInfo {
  private authSubscriptionReferences: { [key: string]: AuthSubscriptionReference } = {};

  constructor(private connectionManagerService: ConnectionManagerService) {

  }

  /**
   * Get a list of all users
   */
  public getUsers(): Observable<UserData[]> {
    return <Observable<UserData[]>>this.getSubscription('users');
  }

  /**
   * Create a new user
   */
  public createUser(userName: string, email: string, password: string, roles: string[], addtionalData: { [key: string]: any })
    : Observable<CreateUserResponse> {
    return <Observable<CreateUserResponse>>this.connectionManagerService.sendCommand(
      new CreateUserCommand(userName, email, password, roles, addtionalData));
  }

  /**
   * Update an existing user
   */
  public updateUser(id: string, userName?: string, email?: string,
                    password?: string, roles?: string[], addtionalData?: { [key: string]: any })
    : Observable<UpdateUserResponse> {
    return <Observable<UpdateUserResponse>>this.connectionManagerService.sendCommand(
      new UpdateUserCommand(id, userName, email, password, roles, addtionalData));
  }

  /**
   * Delete user
   */
  public deleteUser(id: string)
    : Observable<DeleteUserResponse> {
    return <Observable<DeleteUserResponse>>this.connectionManagerService.sendCommand(
      new DeleteUserCommand(id));
  }

  /**
   * Get a list of all roles
   */
  public getRoles(): Observable<RoleData[]> {
    return <Observable<RoleData[]>>this.getSubscription('roles');
  }

  /**
   * Create a new role
   */
  public createRole(name: string)
    : Observable<CreateRoleResponse> {
    return <Observable<CreateRoleResponse>>this.connectionManagerService.sendCommand(
      new CreateRoleCommand(name));
  }

  /**
   * Update an existing role
   */
  public updateRole(id: string, name: string)
    : Observable<UpdateRoleResponse> {
    return <Observable<UpdateRoleResponse>>this.connectionManagerService.sendCommand(
      new UpdateRoleCommand(id, name));
  }

  /**
   * Delete role
   */
  public deleteRole(id: string)
    : Observable<DeleteRoleResponse> {
    return <Observable<DeleteRoleResponse>>this.connectionManagerService.sendCommand(
      new DeleteRoleCommand(id));
  }

  private getSubscription(type: 'users' | 'roles'): Observable<(UserData | RoleData)[]> {
    let authSubscriptionReference: AuthSubscriptionReference = this.authSubscriptionReferences[type];

    if (!authSubscriptionReference) {
      const subscribeCommand = type === 'users' ? new SubscribeUsersCommand() : new SubscribeRolesCommand();

      authSubscriptionReference = {
        count: 0,
        subject$: new BehaviorSubject<RoleData[]>([]),
        subscription: null,
        referenceId: subscribeCommand.referenceId
      };

      authSubscriptionReference.subscription = this.websocketSubscribeData(subscribeCommand, authSubscriptionReference);
      authSubscriptionReference[type] = authSubscriptionReference;
    }

    authSubscriptionReference.count++;
    return this.createAuthSubscriptionObservable$(authSubscriptionReference, type);
  }

  private websocketSubscribeData(subscribeCommand: SubscribeUsersCommand | SubscribeRolesCommand,
                                 authSubscriptionReference: AuthSubscriptionReference) {
    return this.connectionManagerService.sendCommand(subscribeCommand, true)
      .pipe(map((response: (SubscribeRolesResponse | SubscribeUsersResponse)) => {
        if (response.responseType === 'SubscribeRolesResponse') {
          return (<SubscribeRolesResponse>response).roles;
        } else {
          return (<SubscribeUsersResponse>response).users;
        }
      }))
      .subscribe((data: (RoleData | UserData)[]) => {
        authSubscriptionReference.subject$.next(data);
      });
  }

  private createAuthSubscriptionObservable$(authSubscriptionReference: AuthSubscriptionReference, type: string)
    : Observable<(UserData | RoleData)[]> {
    return authSubscriptionReference.subject$.asObservable().pipe(finalize(() => {
      authSubscriptionReference.count--;

      if (authSubscriptionReference.count === 0) {
        this.connectionManagerService.sendCommand((type === 'users' ? new UnsubscribeUsersCommand() : new UnsubscribeRolesCommand()),
          false, true);
        authSubscriptionReference.subject$.complete();
        authSubscriptionReference.subscription.unsubscribe();
        delete this.authSubscriptionReferences[type];
      }
    }));
  }
}
