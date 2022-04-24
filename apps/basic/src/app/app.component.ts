import { Component } from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';
import {DefaultCollection} from 'sapphiredb';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  collection: DefaultCollection<any>;
  values$: Observable<any[]>;

  constructor(private db: SapphireDbService) {
    this.collection = this.db.collection('messages');
    this.values$ = this.collection.values();
  }

  add(): void {
    this.collection.add({
      content: prompt('Message:')
    });
  }

  edit(value: any): void {
    this.collection.update([
      value,
      { content: prompt('New message: ', value.content) }
    ]);
  }

  delete(value: any): void {
    this.collection.remove(value);
  }
}
