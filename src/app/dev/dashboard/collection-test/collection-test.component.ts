import {Component, OnInit} from '@angular/core';
import {SapphireDb, DefaultCollection} from 'ng-sapphiredb';
import {User} from '../../model/user';
import * as faker from 'faker';

@Component({
  selector: 'app-collection-test',
  templateUrl: './collection-test.component.html',
  styleUrls: ['./collection-test.component.less']
})
export class CollectionTestComponent implements OnInit {

  collection: DefaultCollection<User>;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    // const collection1 = this.db.collection<User>('users').skip(2);
    // const collection2 = this.db.collection<User>('users').skip(2);
    this.collection = this.db.collection<User>('users');

    // const collection4 = collection1.take(4);
    // const collection5 = collection1.take(5);

    // collection5.dispose();
    // this.collection = this.db.collection<User>('users');
    //
    // // const sub1 = this.collection.values(new OrderByPrefilter(x => x.id)).subscribe(console.table);
    // // const sub2 = this.collection.values().subscribe(console.table);
    // const sub3 = this.collection.orderBy(x => x.username).thenOrderBy(x => x.id, true)
    //   .values().subscribe(console.table);
  }

  addUser() {
    this.collection.add({
      username: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }).subscribe(console.log);
  }

}
