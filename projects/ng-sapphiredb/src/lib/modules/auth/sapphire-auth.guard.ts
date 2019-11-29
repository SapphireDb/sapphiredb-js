import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {UserData} from './user-data';
import {SapphireDb} from '../../sapphire-db.service';
import {SAPPHIRE_DB_OPTIONS, SapphireDbOptions} from '../../models/sapphire-db-options';

@Injectable()
export class SapphireAuthGuard implements CanActivate, CanActivateChild {
  constructor(private db: SapphireDb, private router: Router,
              @Inject(SAPPHIRE_DB_OPTIONS) private options: SapphireDbOptions) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.db.auth.isLoggedIn().pipe(switchMap((loggedIn: boolean) => {
      if (!loggedIn) {
        this.redirect(this.options.loginRedirect, state.url);
        return of(false);
      }

      const roles: string[] = next.data['roles'];
      return this.checkRoles(roles, state.url);
    }));
  }

  private checkRoles(roles: string[], returnUrl: string): Observable<boolean> {
    return this.db.auth.getUserData().pipe(map((userData: UserData) => {
      if (roles && roles.length > 0) {
        if (!userData) {
          return false;
        }

        let hasRole = false;

        for (const role of roles) {
          if (userData.roles.indexOf(role) !== -1) {
            hasRole = true;
            break;
          }
        }

        if (!hasRole) {
          this.redirect(this.options.unauthorizedRedirect, returnUrl);
          return false;
        }
      }

      return true;
    }));
  }

  private redirect(url: string, returnUrl: string) {
    if (url) {
      this.router.navigate([url], {
        queryParams: {
          return: returnUrl
        }
      });
    }
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }
}
