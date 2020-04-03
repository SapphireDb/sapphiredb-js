import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {

  values$: Observable<any>;

  constructor(private db: SapphireDbService) {
    this.values$ = this.db.collection('demo.entries').take(4).values();
  }

  ngOnInit() {
  }

}
