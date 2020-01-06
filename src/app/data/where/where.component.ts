import { Component, OnInit } from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {SapphireDb} from 'ng-sapphiredb';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-where',
  templateUrl: './where.component.html',
  styleUrls: ['./where.component.less']
})
export class WhereComponent implements OnInit {
  id: string;
  id$ = new ReplaySubject<string>();
  valueById$: Observable<any>;

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: SapphireDb, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('demo.entries')
      .where(['content', 'StartsWith', 'testV'])
      .values();

    this.values2$ = this.db.collection<any>('demo.entries')
      .where([
        [['content', 'StartsWith', 'test'], 'and', ['content', 'EndsWith', 'V']],
        'or',
        [['content', 'StartsWith', 'var'], 'and', ['content', 'EndsWith', '2']]
      ])
      .values();

    this.valueById$ = this.id$.pipe(
      switchMap((id: any) => {
        return this.db.collection<any>('demo.entries').where(['id', '==', id]).first().values();
      })
    );
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('demo.entries').add({
        content: v
      });
    });
  }

}
