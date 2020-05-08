import {Component, OnInit} from '@angular/core';
import {DefaultCollection, primaryKey} from 'sapphiredb';
import {SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {Transform} from 'class-transformer';

class ExampleEntry {
  @primaryKey()
  id?: string;

  @Transform((v: string) => parseInt(v, null), { toClassOnly: true })
  @Transform((v: number) => `123${v}`, { toPlainOnly: true })
  content: number;

  constructor() {
    this.content = 126;
  }
}

@Component({
  selector: 'app-class-transformer',
  templateUrl: './class-transformer.component.html',
  styleUrls: ['./class-transformer.component.less']
})
export class ClassTransformerComponent implements OnInit {

  collection: DefaultCollection<ExampleEntry>;
  values$: Observable<ExampleEntry[]>;

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.entries', ExampleEntry);
    this.values$ = this.collection.values();
  }

  add() {
    this.collection.add(new ExampleEntry());
  }

  update(value: ExampleEntry) {
    this.collection.update([value, { content: 34 }]);
  }

  remove(value: ExampleEntry) {
    this.collection.remove(value);
  }
}
