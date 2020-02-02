import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { SapphireDbService } from 'ng-sapphiredb';
import {take} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private route: ActivatedRoute, private router: Router, private db: SapphireDbService, private httpClient: HttpClient) {}

  userData() {
    return null;
    // return this.db.auth.getUserData();
  }

  loggedIn() {
    return true;
    // return this.db.auth.isLoggedIn();
  }

  logout() {
    // this.db.auth.logout();
  }

  login(username: string, password: string) {
    this.db.execute('user', 'login', username, password).subscribe(response => {
      this.db.setAuthToken(<string>response.result);;
    });

    // this.db.auth.login(username, password).subscribe((data: UserData) => {
    //   this.route.queryParams.pipe(take(1)).subscribe(params => {
    //     this.router.navigateByUrl(params['return'] || '');
    //   });
    // });
  }
}
