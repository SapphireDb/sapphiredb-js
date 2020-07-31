import { Component, OnInit } from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {QueryCollection, SapphireOfflineEntity} from 'sapphiredb';
import {DialogService} from 'ng-metro4';

@Component({
  selector: 'app-server-side-query',
  templateUrl: './server-side-query.component.html',
  styleUrls: ['./server-side-query.component.less']
})
export class ServerSideQueryComponent implements OnInit {

  collection: QueryCollection<any, any[]>;
  values$: Observable<any>;
  snapshot$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) {
    this.collection = this.db.query<any>('demo.entries.only_test');
    this.values$ = this.collection.values();
    this.snapshot$ = this.collection.snapshot();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.add({
        ...new SapphireOfflineEntity(),
        content: v,
      });
    });
  }

  ngOnInit(): void {

  }

}
