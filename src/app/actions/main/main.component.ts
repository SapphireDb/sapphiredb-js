import {Component, OnInit} from '@angular/core';
import {ActionHelper, ActionResult, ExecuteResponseType} from 'sapphiredb';
import { SapphireDbService } from 'ng-sapphiredb';
import {concatMap, filter, map, shareReplay, takeWhile} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  rangeValue$: Observable<number>;
  rangeValueStream$: Observable<number>;
  rangeValueStatus$: Observable<string>;

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
    // this.db.execute('example', 'AsyncEnumerableTest').subscribe(
    //   ActionHelper.result(
    //     () => console.log('complete'),
    //     (value) => console.log(value),
    //     (notification) => console.warn(notification)
    //   ));
  }

  execute() {
    this.rangeValue$ = this.db.execute<string, number>('example', 'AsyncDelay').pipe(
      concatMap(r => {
        if (r.type === ExecuteResponseType.End) {
          return of(r, null);
        }

        return of(r);
      }),
      takeWhile(v => v !== null),
      map((r: ActionResult<string, number>) => r.notification),
      shareReplay()
    );
  }

  executeStream() {
    const result$ = this.db.execute<number, string>('example', 'AsyncEnumerableTest').pipe(
      shareReplay()
    );

    this.rangeValueStream$ = result$.pipe(
      filter(v => v.type === ExecuteResponseType.Async),
      map(v => v.result)
    );

    this.rangeValueStatus$ = result$.pipe(
      filter(v => v.type === ExecuteResponseType.Notify),
      map(v => v.notification)
    );
  }

}
