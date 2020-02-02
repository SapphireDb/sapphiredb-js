import {Component, OnInit} from '@angular/core';
import {ActionResult, ExecuteResponseType} from 'sapphiredb';
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

  constructor(private db: SapphireDbService) { }

  ngOnInit() { }

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

}
