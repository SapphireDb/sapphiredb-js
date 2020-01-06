import {Component, OnInit} from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {classToClass, Transform} from 'class-transformer';

class ExampleEntry {
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

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.entries', ExampleEntry);
    this.values$ = this.collection.values();
  }

  add() {
    this.collection.add(new ExampleEntry());
  }

  update(value: ExampleEntry) {
    const clone = classToClass(value);
    clone.content = 34;
    this.collection.update(clone);
  }

  remove(value: ExampleEntry) {
    this.collection.remove(value);
  }
}