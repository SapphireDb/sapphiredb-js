import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {SapphireDb} from 'ng-sapphiredb';

@Component({
  selector: 'app-prefilter',
  templateUrl: './prefilter.component.html',
  styleUrls: ['./prefilter.component.less']
})
export class PrefilterComponent implements OnInit {

  values$: Observable<any>;

  constructor(private db: SapphireDb, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('demo.entries')
      .where(['content', 'StartsWith', 'testValue'])
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
