import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import { SapphireDbService } from 'ng-sapphiredb';
import {DefaultCollection} from 'sapphiredb';
import {DialogService} from 'ng-metro4';
import {GuidHelper} from '../../../../projects/sapphiredb/src/lib/helper/guid-helper';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.less']
})
export class ManageComponent implements OnInit {
  collection: DefaultCollection<any>;
  values$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.entries');
    this.values$ = this.collection.values();
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.add({
        content: v,
        id: GuidHelper.generateGuid()
      });
    });
  }

  addValues() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.add(...[
        {
          content: '1' + v,
          id: GuidHelper.generateGuid()
        },
        {
          content: '2' + v,
          id: GuidHelper.generateGuid()
        }
      ]);
    });
  }

  deleteValue(value: any) {
    this.collection.remove(value);
  }

  deleteValues(values: any[]) {
    this.collection.remove(...values);
  }

  updateValue(value: any) {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.update({
        ...value,
        content: v
      });
    });
  }

  updateValues(values: any[]) {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.collection.update(...values.map((value, i) => {
        return {
          ...value,
          content: `${i}${v}`
        };
      }));
    });
  }
}
