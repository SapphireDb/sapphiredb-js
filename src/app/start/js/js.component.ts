import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../../shared/platform.service';

@Component({
  selector: 'app-js',
  templateUrl: './js.component.html',
  styleUrls: ['./js.component.less']
})
export class JsComponent implements OnInit {

  constructor(public platform: PlatformService) { }

  ngOnInit() {
  }

}
