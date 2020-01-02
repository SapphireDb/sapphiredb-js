import { Component, OnInit } from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {Observable, of, ReplaySubject} from 'rxjs';
import {debounceTime, filter, map, skip, switchMap} from 'rxjs/operators';

interface Document {
  id?: string;
  name: string;
  content: string;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less']
})
export class EditorComponent implements OnInit {

  collection: DefaultCollection<Document>;

  name: string;
  name$ = new ReplaySubject<string>();

  document$: Observable<Document>;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    this.collection = this.db.collection<Document>('demo.documents');

    this.document$ = this.name$.pipe(
      debounceTime(200),
      filter(v => !!v),
      switchMap((name: string) => {
        const documents$: Observable<Document[]> = this.collection
          .where(['name', '==', name])
          .values();

        return documents$.pipe(
          switchMap((documents: Document[]) => {
            const document = documents[0];

            if (!!document) {
              return of(document);
            }

            return this.collection.add({
              name: name,
              content: ''
            }).pipe(
              map((result) => result.value)
            );
          })
        );
      })
    );
  }

  updateDocument(document: Document, content: string) {
    this.collection.update({
      ...document,
      content: content
    });
  }

}
