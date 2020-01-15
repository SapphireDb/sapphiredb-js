import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemosRoutingModule } from './demos-routing.module';
import {SharedModule} from '../shared.module';
import { ChatComponent } from './chat/chat.component';
import { EditorComponent } from './editor/editor.component';
import { PixelsComponent } from './pixels/pixels.component';
import { StackblitzStarterComponent } from './stackblitz-starter/stackblitz-starter.component';


@NgModule({
  declarations: [ChatComponent, EditorComponent, PixelsComponent, StackblitzStarterComponent],
  imports: [
    SharedModule,
    DemosRoutingModule
  ]
})
export class DemosModule { }
