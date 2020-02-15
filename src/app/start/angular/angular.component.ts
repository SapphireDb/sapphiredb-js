import {Component, Inject, OnInit} from '@angular/core';
import {PlatformService} from '../../shared/platform.service';

@Component({
  selector: 'app-angular',
  templateUrl: './angular.component.html',
  styleUrls: ['./angular.component.less']
})
export class AngularComponent implements OnInit {
  constructor(public platform: PlatformService) { }

  ngOnInit() {
  }

}
