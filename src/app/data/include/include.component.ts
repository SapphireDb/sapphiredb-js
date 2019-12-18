import {Component, OnInit} from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-include',
  templateUrl: './include.component.html',
  styleUrls: ['./include.component.less']
})
export class IncludeComponent implements OnInit {

  private collection: DefaultCollection<any>;
  private collectionEntries: DefaultCollection<any>;

  public values$: Observable<any[]>;
  public valuesEntries$: Observable<any[]>;

  constructor(private db: SapphireDb) {
    this.collection = this.db.collection('Users', 'Demo').include('Entries');
    this.values$ = this.collection.values();

    this.collectionEntries = this.db.collection('UserEntries', 'Demo').include('User');
    this.valuesEntries$ = this.collectionEntries.values();
  }

  ngOnInit() {
  }

  createWithEntry() {
    this.collection.add({
      name: 'Example username',
      entries: [
        {
          content: 'Example content'
        }
      ]
    });
  }

  deleteUser(value: any) {
    this.collection.remove(value);
    return false;
  }

  updateUser(value: any) {
    this.collection.update({
      ...value,
      name: 'Updated username',
      entries: [
        {
          content: 'New entry'
        }
      ]
    });
  }

  updateEntry(value: any) {
    this.collectionEntries.update({
      ...value,
      content: 'Updated entry content'
    });
  }

  deleteEntry(value: any) {
    this.collectionEntries.remove(value);
    return false;
  }
}
