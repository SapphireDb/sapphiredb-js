import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.less']
})
export class SelectComponent implements OnInit {

  values$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      .select(v => v.content.toUpperCase())
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
