import {NgModule} from '@angular/core';

import {DemosRoutingModule} from './demos-routing.module';
import {SharedModule} from '../shared.module';
import {ChatComponent} from './chat/chat.component';
import {EditorComponent} from './editor/editor.component';
import {PixelsComponent} from './pixels/pixels.component';
import {ExamplesComponent} from './examples/examples.component';


@NgModule({
  declarations: [ChatComponent, EditorComponent, PixelsComponent, ExamplesComponent],
  imports: [
    SharedModule,
    DemosRoutingModule
  ]
})
export class DemosModule { }
