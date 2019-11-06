import {Component} from '@angular/core';
import {RealtimeDatabase, UserData} from 'ng-realtime-database';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  userInfo$: Observable<UserData>;
  status$: Observable<any>;

  constructor(private db: RealtimeDatabase, private router: Router) {
    this.userInfo$ = this.db.auth.getUserData();
    this.status$ = this.db.getStatus$();

    // this.db.execute('tes', 'test').subscribe(console.log, console.warn);
  }

  logout() {
    this.db.auth.logout().subscribe(() => {
      this.db.reset();
      this.router.navigate(['account', 'login']);
    });
  }

}
