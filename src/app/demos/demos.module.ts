import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemosRoutingModule } from './demos-routing.module';
import {SharedModule} from '../shared.module';
import { ChatComponent } from './chat/chat.component';


@NgModule({
  declarations: [ChatComponent],
  imports: [
    SharedModule,
    DemosRoutingModule
  ]
})
export class DemosModule { }
