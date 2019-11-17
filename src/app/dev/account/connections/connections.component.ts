import { Component, OnInit } from '@angular/core';
import {RealtimeDatabase, RealtimeConnection, ConnectionResponse} from 'ng-realtime-database';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.less']
})
export class ConnectionsComponent implements OnInit {

  connectionData$: Observable<ConnectionResponse>;
  connections$: Observable<RealtimeConnection[]>;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.connectionData$ = this.db.auth.getConnectionData();
    this.queryConnections$();
  }

  queryConnections$() {
    this.connections$ = combineLatest([this.connectionData$, this.db.auth.getConnections()])
      .pipe(map(([connectionData, connections]: [ConnectionResponse, RealtimeConnection[]]) => {
        return connections.filter(c => c.id !== connectionData.connectionId);
    }));
  }

  closeConnection(connection: RealtimeConnection) {
    this.db.auth.closeConnection(connection.id, true).subscribe(() => {
      this.queryConnections$();
    });
  }
}
