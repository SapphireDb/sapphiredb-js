import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AccountService} from '../../shared/services/account.service';
import {RealtimeDatabase, UserData} from 'ng-realtime-database';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ActionResult} from '../../../../projects/ng-realtime-database/src/lib/models/action-result';
import {AppUser} from '../../model/app-user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  public users$: Observable<AppUser[]>;
  public form: FormGroup;

  constructor(private accountService: AccountService, private db: RealtimeDatabase) {
    this.form = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });

    this.users$ = this.db.execute('user', 'GetUsers').pipe(map((result: ActionResult<AppUser[], null>) => {
      return result.result;
    }));
  }

  ngOnInit() {
  }

  select(user: AppUser) {
    this.form.setValue({
      email: user.email,
      password: 'pw1234'
    });
  }

  login() {
    this.accountService.login(this.form.get('email').value, this.form.get('password').value);
  }
}
