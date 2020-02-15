import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../../shared/platform.service';

@Component({
  selector: 'app-net-core',
  templateUrl: './net-core.component.html',
  styleUrls: ['./net-core.component.less']
})
export class NetCoreComponent implements OnInit {

  constructor(public platform: PlatformService) { }

  ngOnInit() {
  }

}
