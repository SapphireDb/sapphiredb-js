import {Component, OnInit} from '@angular/core';
import {CreateRangeResponse, DefaultCollection, SapphireOfflineEntity} from 'sapphiredb';
import {Observable, of, ReplaySubject} from 'rxjs';
import {debounceTime, filter, map, switchMap} from 'rxjs/operators';
import {SapphireDbService} from 'ng-sapphiredb';

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

  constructor(private db: SapphireDbService) { }

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
              content: '',
              id: new SapphireOfflineEntity().id
            }).pipe(
              map((result: CreateRangeResponse) => result.results[0].value)
            );
          })
        );
      })
    );
  }

  updateDocument(document: Document, content: string) {
    this.collection.update([document, {
      content: content
    }]);
  }

}
