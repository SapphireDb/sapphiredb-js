import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {SapphireDbService} from 'ng-sapphiredb';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit, OnDestroy {
  message$: Observable<any>;
  topic$: Observable<any>;

  message: string;

  subscriptions = [];

  constructor(private db: SapphireDbService) {

  }

  ngOnInit() {
    this.message$ = this.db.messaging.messages();
    this.topic$ = this.db.messaging.topic('test');
  }

  send() {
    this.db.messaging.send(this.message);
  }

  publish() {
    this.db.messaging.publish('test', this.message, true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}
