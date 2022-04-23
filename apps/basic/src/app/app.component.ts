import { Component } from '@angular/core';
import {SapphireDbService} from 'ng-sapphiredb';

@Component({
  selector: 'sapphiredb-js-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private db: SapphireDbService) {
    
  }
}
