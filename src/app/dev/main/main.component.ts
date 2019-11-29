import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {UserData, SapphireDb} from 'ng-sapphiredb';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  userInfo$: Observable<UserData>;
  status$: Observable<any>;

  constructor(private db: SapphireDb, private router: Router) {
    this.userInfo$ = this.db.auth.getUserData();
    this.status$ = this.db.getStatus$();
  }

  logout() {
    this.db.auth.logout().subscribe(() => {
      this.db.reset();
      this.router.navigate(['dev', 'account', 'login']);
    });
  }

  ngOnInit(): void {
  }
}
