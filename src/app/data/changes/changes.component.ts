import {Component, OnInit} from '@angular/core';
import { SapphireDbService } from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {filter, map, scan, shareReplay} from 'rxjs/operators';
import {ChangesResponse} from 'sapphiredb';

@Component({
  selector: 'app-changes',
  templateUrl: './changes.component.html',
  styleUrls: ['./changes.component.less']
})
export class ChangesComponent implements OnInit {

  changes$: Observable<any[]>;
  values$: Observable<any>;

  constructor(private db: SapphireDbService, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection('demo.entries').values();

    this.changes$ = this.db.collection('demo.entries').changes().pipe(
      filter(v => v.responseType !== 'QueryResponse'),
      map((r: ChangesResponse) => r.changes),
      scan((arr, v) => [...arr, ...v].Reverse().Take(10).Reverse(), [])
    );
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('demo.entries').add({
        content: v
      });
    });
  }
}
