import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StartRoutingModule } from './start-routing.module';
import { MainComponent } from './main/main.component';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    StartRoutingModule
  ]
})
export class StartModule { }
