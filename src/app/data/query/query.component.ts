import { Component, OnInit } from '@angular/core';
import { SapphireDbService } from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {shareReplay, take} from 'rxjs/operators';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.less']
})
export class QueryComponent implements OnInit {

  values$: Observable<any>;
  valuesSnapshot$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection('demo.entries').values();
    this.valuesSnapshot$ = this.db.collection('demo.entries').snapshot();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('demo.entries').add({
        content: v
      });
    });
  }
}
