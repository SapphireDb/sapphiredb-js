import {Component, OnInit} from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {DialogService} from 'ng-metro4';
import {filter, scan, shareReplay} from 'rxjs/operators';

@Component({
  selector: 'app-changes',
  templateUrl: './changes.component.html',
  styleUrls: ['./changes.component.less']
})
export class ChangesComponent implements OnInit {

  changes$: Observable<any[]>;
  values$: Observable<any>;

  constructor(private db: SapphireDb, private dialogService: DialogService) { }

  ngOnInit() {
    this.values$ = this.db.collection('entries', 'demo').values();

    this.changes$ = this.db.collection('entries', 'demo').changes().pipe(
      filter(v => v.responseType !== 'QueryResponse'),
      scan((arr, v) => [...arr, v].Reverse().Take(10).Reverse(), [])
    );
  }

  addValue() {
    this.dialogService.prompt('Content', 'Please enter a new content').subscribe((v) => {
      this.db.collection('entries', 'demo').add({
        content: v
      });
    });
  }
}
