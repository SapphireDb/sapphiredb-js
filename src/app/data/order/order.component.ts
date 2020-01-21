import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import { SortDirection} from 'sapphiredb';
import { SapphireDb } from 'ng-sapphiredb';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less']
})
export class OrderComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: SapphireDb, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('demo.entries')
      .orderBy('content', SortDirection.ascending)
      .values();

    this.values2$ = this.db.collection<any>('demo.entries')
      .orderBy('content', SortDirection.descending)
      .values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('demo.entries').add({
        content: v
      });
    });
  }
}
