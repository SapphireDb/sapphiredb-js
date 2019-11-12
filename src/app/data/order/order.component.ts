import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less']
})
export class OrderComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      .orderBy(v => v.content, false)
      .values();

    this.values2$ = this.db.collection<any>('entries', 'demo')
      .orderBy(v => v.content, true)
      .values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('entries', 'demo').add({
        content: v
      }).subscribe();
    });
  }
}
