import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {DefaultCollection} from 'sapphiredb';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {

  collection: DefaultCollection<any>;
  values$: Observable<any>;

  constructor(private db: SapphireDbService) {
    this.collection = this.db.collection('demo.entries');
    this.values$ = this.collection.take(4).values();
  }

  ngOnInit() {
  }

  add() {
    this.collection.add({
      content: 'This is an example text'
    });
  }

  remove(item: any) {
    this.collection.remove(item);
  }
}
