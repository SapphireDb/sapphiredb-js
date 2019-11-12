import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-where',
  templateUrl: './where.component.html',
  styleUrls: ['./where.component.less']
})
export class WhereComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      .where(v => v.content.startsWith('testValue'))
      .values();

    this.values2$ = this.db.collection<any>('entries', 'demo')
      .where((v, [x, x2]) => v.content === x || v.content === x2, 'testValue', 'testValue2')
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
