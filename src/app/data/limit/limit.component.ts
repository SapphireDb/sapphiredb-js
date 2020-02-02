import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import { SapphireDbService } from 'ng-sapphiredb';

@Component({
  selector: 'app-limit',
  templateUrl: './limit.component.html',
  styleUrls: ['./limit.component.less']
})
export class LimitComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;
  valueFirst$: Observable<any>;
  valueLast$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('demo.entries')
      .take(5)
      .values();

    this.values2$ = this.db.collection<any>('demo.entries')
      .skip(5)
      .values();

    this.valueFirst$ = this.db.collection<any>('demo.entries')
      .first()
      .values();

    this.valueLast$ = this.db.collection<any>('demo.entries')
      .last()
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
