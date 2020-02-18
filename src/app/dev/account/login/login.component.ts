import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AccountService} from '../../services/account.service';
import {ActionResult} from 'sapphiredb';
import { SapphireDbService } from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AppUser} from '../../model/app-user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  public users$: Observable<AppUser[]>;
  public form: FormGroup;

  constructor(private accountService: AccountService, private db: SapphireDbService) {
    this.form = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });

    // this.db.execute('tes.test').subscribe(console.log);

    this.users$ = this.db.execute('user.GetUsers').pipe(map((result: ActionResult<AppUser[], null>) => {
      return result.result;
    }));
  }

  ngOnInit() {
  }

  createUser() {
    this.db.execute('user.CreateUser', { firstName: 'Morris', lastName: 'Janatzek', email: 'test@test.de', password: 'pw1234' });
    this.db.execute('user.AddRole', 'test@test.de', 'admin');
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
