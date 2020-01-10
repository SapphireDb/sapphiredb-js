import {NgModule} from '@angular/core';

import {StartRoutingModule} from './start-routing.module';
import {MainComponent} from './main/main.component';
import {NetCoreComponent} from './net-core/net-core.component';
import {AngularComponent} from './angular/angular.component';
import {SharedModule} from '../shared.module';
import {ImplementationsComponent} from './implementations/implementations.component';
import { ContributionComponent } from './contribution/contribution.component';


@NgModule({
  declarations: [MainComponent, NetCoreComponent, AngularComponent, ImplementationsComponent, ContributionComponent],
  imports: [
    SharedModule,
    StartRoutingModule
  ]
})
export class StartModule { }
