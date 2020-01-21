import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemosRoutingModule } from './demos-routing.module';
import {SharedModule} from '../shared.module';
import { ChatComponent } from './chat/chat.component';
import { EditorComponent } from './editor/editor.component';
import { PixelsComponent } from './pixels/pixels.component';
import { StackblitzStarterComponent } from './stackblitz-starter/stackblitz-starter.component';
import { ExamplesComponent } from './examples/examples.component';


@NgModule({
  declarations: [ChatComponent, EditorComponent, PixelsComponent, StackblitzStarterComponent, ExamplesComponent],
  imports: [
    SharedModule,
    DemosRoutingModule
  ]
})
export class DemosModule { }
