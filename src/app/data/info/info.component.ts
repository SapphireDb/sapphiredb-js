import {Component, OnInit} from '@angular/core';
import {AuthCollectionInfo, RealtimeDatabase} from 'ng-realtime-database';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less']
})
export class InfoComponent implements OnInit {

  info: AuthCollectionInfo;

  constructor(private db: RealtimeDatabase) { }

  ngOnInit() {
    this.info = this.db.collection('entries', 'demo').authInfo;
  }

}
