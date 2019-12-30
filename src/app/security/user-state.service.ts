import { Injectable } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class UserStateService {
  public currentUser$ = new BehaviorSubject<string>(null);

  constructor(private db: SapphireDb) { }

  public login(username: string, password: string) {
    this.db.execute('user', 'login', username, password).subscribe(response => {
      this.db.setAuthToken(<string>response.result);
      this.currentUser$.next(username);
    });
  }

  public logout() {
    this.db.setAuthToken();
    this.currentUser$.next(null);
  }
}
