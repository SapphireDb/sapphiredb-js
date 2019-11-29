import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SapphireDb, UserData} from 'ng-sapphiredb';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private route: ActivatedRoute, private router: Router, private db: SapphireDb) {}

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
