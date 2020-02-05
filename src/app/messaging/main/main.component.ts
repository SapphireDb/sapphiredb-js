import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import { SapphireDbService } from 'ng-sapphiredb';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
  message$: Observable<any>;
  topic$: Observable<any>;

  message: string;

  constructor(private db: SapphireDbService) {
    this.db.messaging.messages().subscribe((m) => {
      console.log(m);
    });
  }

  ngOnInit() {
    this.message$ = this.db.messaging.messages();
    this.topic$ = this.db.messaging.topic('test');
  }

  send() {
    this.db.messaging.send(this.message, 'admin');
  }

  publish() {
    this.db.messaging.publish('test', this.message);
  }
}
