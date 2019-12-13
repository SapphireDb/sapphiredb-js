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

  constructor(private db: SapphireDb, private dialogService: DialogService) {
    // let t = new ConditionBuilder()
    //   .condition('from', '==', 1).and().condition('to', '==', 2).or().condition('test', '==', null).group()
    //   .or()
    //   .condition('from', '==', 2).and().condition('to', '==', 1).or().condition('test', '<=', null).group()
    //   .and()
    //   .condition('from', '==', 4).or().condition('to', '==', 4).group()
    //   .and()
    //   .condition('a', '==', 'b');
    // console.log(t);
  }


  ngOnInit() {
    this.values$ = this.db.collection<any>('entries', 'demo')
      // .where(v => v.content.startsWith('testValue'))
      .values();

    this.values2$ = this.db.collection<any>('entries', 'demo')
      .where(builder => builder
          .condition('content', '==', 'testValue')
          .or()
          .condition('content', '==', 'testValue2'))
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
