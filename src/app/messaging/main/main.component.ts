import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
  message$: Observable<any>;
  topic$: Observable<any>;

  message: string;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.message$ = this.db.messaging.messages();
    this.topic$ = this.db.messaging.topic('test');
  }

  send() {
    this.db.messaging.send(this.message);
  }

  publish() {
    this.db.messaging.publish('test', this.message);
  }
}
