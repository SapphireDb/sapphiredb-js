import { Component, OnInit } from '@angular/core';
import { SapphireDbService } from 'ng-sapphiredb';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.less']
})
export class AuthComponent implements OnInit {

  dbName: string;

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
  }

  testConnection() {
    this.db.execute('db.testConnection', this.dbName).subscribe(console.log);
  }

  saveConnection() {
    this.db.execute('db.updateSettings', this.dbName).subscribe(console.log);
  }
}

