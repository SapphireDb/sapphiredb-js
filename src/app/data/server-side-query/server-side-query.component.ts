import { Component, OnInit } from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-server-side-query',
  templateUrl: './server-side-query.component.html',
  styleUrls: ['./server-side-query.component.less']
})
export class ServerSideQueryComponent implements OnInit {

  values$: Observable<any>;

  constructor(private db: SapphireDbService) {
    this.values$ = this.db.query<any>('demo.entries.only_test').values();
  }

  ngOnInit(): void {
  }

}
