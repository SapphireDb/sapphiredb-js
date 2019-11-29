import { Component, OnInit } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import {Observable, of, Subject} from 'rxjs';
import {debounce, debounceTime, filter, map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  input$ = new Subject<string>();
  hash$: Observable<string>;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
    this.hash$ = this.input$.pipe(
      debounceTime(200),
      filter(v => !!v),
      switchMap((v) => {
        return this.db.execute<string, null>('Example', 'CreateHash', v).pipe(
          map(r => r.result)
        );
      })
    );
  }
}
