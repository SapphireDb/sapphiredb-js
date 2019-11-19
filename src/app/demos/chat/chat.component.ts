import { Component, OnInit } from '@angular/core';
import {DefaultCollection, RealtimeDatabase} from 'ng-realtime-database';
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

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.messageCollection = this.db.collection<Message>('messages', 'demo');

    this.messages$ = combineLatest([this.from$, this.to$]).pipe(
      debounceTime(200),
      switchMap(([from, to]: [string, string]) => {
        if (!from || !to) {
          return of([]);
        }

        return this.messageCollection
          .where((m, [valueFrom, valueTo]) => (m.from === valueFrom || m.to === valueFrom) && (m.to === valueTo || m.from === valueTo), from, to)
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
      }).subscribe();

      this.message = '';
    }
  }
}
