import { Component, OnInit } from '@angular/core';
import {DefaultCollection} from 'sapphiredb';
import { SapphireDbService } from 'ng-sapphiredb';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent implements OnInit {

  collection: DefaultCollection<any>;
  values$: Observable<any[]>;
  logs$: Observable<any[]>;

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.eventDemos');
    this.values$ = this.collection.values();
    this.logs$ = this.db.collection('demo.logs').values();
  }

  create() {
    this.collection.add({
      content: 'Test 123'
    });
  }

  update(value: any) {
    this.collection.update({
      ...value,
      content: 'Updated content'
    });
  }

  remove(value: any) {
    this.collection.remove(value);
  }

}
