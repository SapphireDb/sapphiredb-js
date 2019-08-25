import { Component, OnInit } from '@angular/core';
import {RealtimeDatabase, WebsocketConnection} from 'ng-realtime-database';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.less']
})
export class ConnectionsComponent implements OnInit {

  connectionId$: Observable<string>;
  connections$: Observable<WebsocketConnection[]>;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.connectionId$ = this.db.auth.getConnectionId();
    this.queryConnections$();
  }

  queryConnections$() {
    this.connections$ = combineLatest([this.connectionId$, this.db.auth.getConnections()])
      .pipe(map(([connectionId, connections]: [string, WebsocketConnection[]]) => {
        return connections.filter(c => c.id !== connectionId);
    }));
  }

  closeConnection(connection: WebsocketConnection) {
    this.db.auth.closeConnection(connection.id, true).subscribe(() => {
      this.queryConnections$();
    });
  }
}
