import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { MainComponent } from './main/main.component';
import {SharedModule} from '../shared.module';
import {FormsModule} from '@angular/forms';
import { NlbComponent } from './nlb/nlb.component';


@NgModule({
  declarations: [MainComponent, NlbComponent],
  imports: [
    SharedModule,
    FormsModule,
    ConfigurationRoutingModule
  ]
})
export class ConfigurationModule { }
