import { Component, OnInit } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import * as faker from 'faker';
import {User} from '../../model/user';
import {Observable, ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.less']
})
export class TestComponent implements OnInit {

  constructor(private db: SapphireDb) {
    // this.values$.subscribe(console.log);
  }

  values$: Observable<User[]>;

  ngOnInit() {
    const collection = this.db.collection<User>('users');

    this.values$ = collection.values();

    // collection.values().subscribe(v => {
    //   v.forEach(u => {
    //     collection.remove(u).subscribe(console.log);
    //   });
    // });

    // for (let i = 0; i < 50; i++) {
    //   collection.add({
    //     username: faker.internet.password(),
    //     firstName: faker.name.firstName(),
    //     lastName: faker.name.lastName()
    //   }).subscribe(console.log);
    // }

  }
}
