import { Component, OnInit } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import {UserStateService} from '../user-state.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-current-user',
  templateUrl: './current-user.component.html',
  styleUrls: ['./current-user.component.less']
})
export class CurrentUserComponent implements OnInit {

  public currentUser$: Observable<string>;

  constructor(private db: SapphireDb, private userState: UserStateService) { }

  ngOnInit() {
    this.currentUser$ = this.userState.currentUser$;
  }

  login(username: string, password: string) {
    this.userState.login(username, password);
  }

  logout() {
    this.userState.logout();
  }
}
