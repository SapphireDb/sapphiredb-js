import { Component, OnInit } from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {combineLatest, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, switchMap} from 'rxjs/operators';

interface Message {
  from: string;
  to: string;
  content: string;
  createdOn?: string;
  id?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
  from: string;
  to: string;
  message: string;

  from$ = new ReplaySubject<string>();
  to$ = new ReplaySubject<string>();

  messages$: Observable<Message[]>;

  messageCollection: DefaultCollection<Message>;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    this.messageCollection = this.db.collection<Message>('demo.messages');

    this.messages$ = combineLatest([this.from$, this.to$]).pipe(
      debounceTime(200),
      switchMap(([from, to]: [string, string]) => {
        if (!from || !to) {
          return of([]);
        }

        return this.messageCollection
          .where([[['from', '==', from], 'and', ['to', '==', to]], 'or', [['from', '==', to], 'and', ['to', '==', from]]])
          .values();
      })
    );
  }

  send() {
    if (!!this.message) {
      this.messageCollection.add({
        from: this.from,
        to: this.to,
        content: this.message
      });

      this.message = '';
    }
  }
}
