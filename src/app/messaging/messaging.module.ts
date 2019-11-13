import {NgModule} from '@angular/core';

import {MessagingRoutingModule} from './messaging-routing.module';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../shared.module';


@NgModule({
  declarations: [MainComponent],
  imports: [
    SharedModule,
    MessagingRoutingModule
  ]
})
export class MessagingModule { }
