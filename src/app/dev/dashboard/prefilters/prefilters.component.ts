import {Component, OnInit} from '@angular/core';
import {DefaultCollection, ReducedCollection, SortDirection} from 'sapphiredb';
import { SapphireDb } from 'ng-sapphiredb';
import {User} from '../../model/user';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-prefilters',
  templateUrl: './prefilters.component.html',
  styleUrls: ['./prefilters.component.less']
})
export class PrefiltersComponent implements OnInit {

  collection: DefaultCollection<User>;
  collectionValues$: Observable<User[]>;

  collectionWhere: DefaultCollection<User>;
  whereValues$: Observable<User[]>;

  collectionSkip: DefaultCollection<User>;
  skipValues$: Observable<User[]>;

  collectionTake: DefaultCollection<User>;
  takeValues$: Observable<User[]>;

  collectionOrder: DefaultCollection<User>;
  orderValues$: Observable<User[]>;

  collectionOrder2: DefaultCollection<User>;
  order2Values$: Observable<User[]>;

  collectionSelect: ReducedCollection<User, string[]>;
  selectValues$: Observable<string[]>;

  collectionCount: ReducedCollection<User, number>;
  countValues$: Observable<number>;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    this.collection = this.db.collection<User>('users');
    this.collectionValues$ = this.collection.values();

    // setTimeout(() => {
    //   this.collectionValues$.subscribe(console.log);
    // }, 1000);

    // this.collectionWhere = this.collection.where(u => u.username !== 'test123');
    // this.whereValues$ = this.collectionWhere.values();

    this.collectionSkip = this.collection.skip(2);
    this.skipValues$ = this.collectionSkip.values();

    this.collectionTake = this.collection.take(3);
    this.takeValues$ = this.collectionTake.values();

    this.collectionOrder = this.collection.orderBy('id', SortDirection.descending);
    this.orderValues$ = this.collectionOrder.values();

    this.collectionOrder2 = this.collection.orderBy('username').thenOrderBy('id', SortDirection.descending);
    this.order2Values$ = this.collectionOrder2.values();

    this.collectionSelect = this.collection.select('username');
    this.selectValues$ = this.collectionSelect.values();

    this.collectionCount = this.collection.count();
    this.countValues$ = this.collectionCount.values();
  }

}
