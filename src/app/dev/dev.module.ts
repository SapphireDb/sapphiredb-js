import {NgModule} from '@angular/core';

import {DevRoutingModule} from './dev-routing.module';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../shared.module';


@NgModule({
  declarations: [MainComponent],
  imports: [
    SharedModule,
    DevRoutingModule
  ]
})
export class DevModule { }
