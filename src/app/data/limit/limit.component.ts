import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-limit',
  templateUrl: './limit.component.html',
  styleUrls: ['./limit.component.less']
})
export class LimitComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      .take(5)
      .values();

    this.values2$ = this.db.collection<any>('entries', 'demo')
      .skip(5)
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
