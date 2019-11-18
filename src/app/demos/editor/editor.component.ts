import { Component, OnInit } from '@angular/core';
import {DefaultCollection, RealtimeDatabase} from 'ng-realtime-database';
import {Observable, of, ReplaySubject} from 'rxjs';
import {debounceTime, filter, map, skip, switchMap} from 'rxjs/operators';

interface Document {
  id?: number;
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

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.collection = this.db.collection<Document>('documents', 'demo');

    this.document$ = this.name$.pipe(
      debounceTime(200),
      filter(v => !!v),
      switchMap((name: string) => {
        const documents$: Observable<Document[]> = this.collection
          .where((d, [documentName]) => d.name === documentName, name)
          .take(1)
          .values();

        return documents$.pipe(
          skip(1),
          switchMap((documents: Document[]) => {
            if (documents.length === 1) {
              return of(documents[0]);
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
    }).subscribe();
  }

}
