import {NgModule} from '@angular/core';

import {ActionsRoutingModule} from './actions-routing.module';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../shared.module';


@NgModule({
  declarations: [MainComponent],
  imports: [
    SharedModule,
    ActionsRoutingModule
  ]
})
export class ActionsModule { }
