import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DocComponent} from './shared/doc/doc.component';
import {NgMetro4Module} from 'ng-metro4';
import {HighlightModule} from 'ngx-highlightjs';



@NgModule({
  declarations: [
    DocComponent
  ],
  imports: [
    CommonModule,
    NgMetro4Module,
    HighlightModule
  ],
  exports: [
    DocComponent,
    NgMetro4Module,
    HighlightModule
  ]
})
export class SharedModule { }
