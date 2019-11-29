import { Component, OnInit } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.less']
})
export class AuthComponent implements OnInit {

  dbName: string;

  constructor(private db: SapphireDb) { }

  ngOnInit() {
  }

  testConnection() {
    this.db.execute('db', 'testConnection', this.dbName).subscribe(console.log);
  }

  saveConnection() {
    this.db.execute('db', 'updateSettings', this.dbName).subscribe(console.log);
  }
}

