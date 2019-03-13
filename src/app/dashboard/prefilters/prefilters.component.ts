import { Component, OnInit } from '@angular/core';
import {Collection, RealtimeDatabase, CollectionBase} from 'ng-realtime-database';
import {User} from '../../model/user';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-prefilters',
  templateUrl: './prefilters.component.html',
  styleUrls: ['./prefilters.component.less']
})
export class PrefiltersComponent implements OnInit {

  collection: Collection<User>;
  collectionValues$: Observable<User[]>;

  collectionWhere: CollectionBase<User>;
  whereValues$: Observable<User[]>;

  collectionSkip: CollectionBase<User>;
  skipValues$: Observable<User[]>;

  collectionTake: CollectionBase<User>;
  takeValues$: Observable<User[]>;

  collectionOrder: CollectionBase<User>;
  orderValues$: Observable<User[]>;

  collectionOrder2: CollectionBase<User>;
  order2Values$: Observable<User[]>;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.collection = this.db.collection<User>('users');
    this.collectionValues$ = this.collection.values();

    this.collectionWhere = this.collection.where(u => u.username !== 'test123');
    this.whereValues$ = this.collectionWhere.values();

    this.collectionSkip = this.collection.skip(2);
    this.skipValues$ = this.collectionSkip.values();

    this.collectionTake = this.collection.take(3);
    this.takeValues$ = this.collectionTake.values();

    this.collectionOrder = this.collection.orderBy(v => v.id, true);
    this.orderValues$ = this.collectionOrder.values();

    this.collectionOrder2 = this.collection.orderBy(v => v.username).thenOrderBy(v => v.id, true);
    this.order2Values$ = this.collectionOrder2.values();
  }

}
