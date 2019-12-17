import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {SapphireDb} from 'ng-sapphiredb';

@Component({
  selector: 'app-where',
  templateUrl: './where.component.html',
  styleUrls: ['./where.component.less']
})
export class WhereComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: SapphireDb, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      .where(['content', 'StartsWith', 'testV'])
      .values();

    this.values2$ = this.db.collection<any>('entries', 'demo')
      .where([
        [['content', 'StartsWith', 'test'], 'and', ['content', 'EndsWith', 'V']],
        'or',
        [['content', 'StartsWith', 'var'], 'and', ['content', 'EndsWith', '2']]
      ])
      .values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('entries', 'demo').add({
        content: v
      });
    });
  }

}
