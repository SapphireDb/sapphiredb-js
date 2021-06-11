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
  values$: Observable<any[]>;
  snapshot$: Observable<any[]>;

  defaultQueryCollection: QueryCollection<any, any[]>;
  defaultQueryValues$: Observable<any[]>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) {
    this.collection = this.db.query<any>('demo.entries.only_test');
    this.values$ = this.collection.values();
    this.snapshot$ = this.collection.snapshot();

    this.defaultQueryCollection = this.db.query<any>('demo.serverSideQueryWithDefaults.by_content');
    this.defaultQueryValues$ = this.defaultQueryCollection.values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.add({
        ...new SapphireOfflineEntity(),
        content: v,
      });
    });
  }

  addValueDefaultQuery() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.defaultQueryCollection.add({
        ...new SapphireOfflineEntity(),
        content: v,
      });
    });
  }

  deleteDefaultQueryValue(entry: any) {
    this.defaultQueryCollection.remove(entry);
  }

  ngOnInit(): void {

  }

}
