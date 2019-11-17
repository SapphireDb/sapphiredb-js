import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RealtimeDatabase} from 'ng-realtime-database';
import {UserData} from '../../../../projects/ng-realtime-database/src/lib/models/user-data';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private route: ActivatedRoute, private router: Router, private db: RealtimeDatabase) {}

  userData() {
    return this.db.auth.getUserData();
  }

  loggedIn() {
    return this.db.auth.isLoggedIn();
  }

  logout() {
    this.db.auth.logout();
  }

  login(username: string, password: string) {
    this.db.auth.login(username, password).subscribe((data: UserData) => {
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        this.router.navigateByUrl(params['return'] || '');
      });
    });
  }
}
