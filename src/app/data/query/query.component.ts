import { Component, OnInit } from '@angular/core';
import {RealtimeDatabase} from 'ng-realtime-database';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.less']
})
export class QueryComponent implements OnInit {

  values$: Observable<any>;
  valuesSnapshot$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection('entries', 'demo').values();
    this.valuesSnapshot$ = this.db.collection('entries', 'demo').snapshot();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('entries', 'demo').add({
        content: v
      }).subscribe();
    });
  }
}
