import { Component, OnInit } from '@angular/core';
import {RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.less']
})
export class AuthComponent implements OnInit {

  dbName: string;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
  }

  testConnection() {
    this.db.execute('db', 'testConnection', this.dbName).subscribe(console.log);
  }

  saveConnection() {
    this.db.execute('db', 'updateSettings', this.dbName).subscribe(console.log);
  }
}

