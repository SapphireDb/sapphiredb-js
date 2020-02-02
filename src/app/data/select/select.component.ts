import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import { SapphireDbService } from 'ng-sapphiredb';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.less']
})
export class SelectComponent implements OnInit {

  values$: Observable<any>;
  values2$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection<any>('demo.entries')
      .select<string>('content')
      .values();

    this.values2$ = this.db.collection<any>('demo.entries')
      .select<string>('content', 'id')
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
