import { Component, OnInit } from '@angular/core';
import {ActionResult, ExecuteResponseType, SapphireDb, ActionHelper} from 'ng-sapphiredb';
import {concatMap, filter, map, shareReplay, takeWhile} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  rangeValue$: Observable<number>;

  constructor(private db: SapphireDb) { }

  ngOnInit() { }

  execute() {
    this.rangeValue$ = this.db.execute('example', 'AsyncDelay').pipe(
      filter((r: ActionResult<number, number>) => r.type === ExecuteResponseType.Notify),
      map((r: ActionResult<number, number>) => r.notification),
      concatMap(v => {
        if (v === 100) {
          return of(v, null);
        }

        return of(v);
      }),
      takeWhile(v => v !== null),
      shareReplay()
    );
  }

}
