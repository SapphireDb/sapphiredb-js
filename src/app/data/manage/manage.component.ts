import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {RealtimeDatabase, DefaultCollection} from 'ng-realtime-database';
import {DialogService} from 'ng-metro4';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.less']
})
export class ManageComponent implements OnInit {
  collection: DefaultCollection<any>;
  values$: Observable<any>;

  constructor(private db: RealtimeDatabase, private dialogService: DialogService) { }

  ngOnInit() {
    this.collection = this.db.collection('entries', 'demo');
    this.values$ = this.collection.values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.add({
        content: v
      }).subscribe();
    });
  }

  deleteValue(value: any) {
    this.collection.remove(value).subscribe();
  }

  updateValue(value: any) {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.update({
        ...value,
        content: v
      }).subscribe();
    });
  }
}
