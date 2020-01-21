import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChatComponent} from './chat/chat.component';
import {EditorComponent} from './editor/editor.component';
import {PixelsComponent} from './pixels/pixels.component';
import {StackblitzStarterComponent} from './stackblitz-starter/stackblitz-starter.component';
import {ExamplesComponent} from './examples/examples.component';


const routes: Routes = [
  { path: 'chat', component: ChatComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'pixels', component: PixelsComponent },
  { path: 'stackblitz', component: StackblitzStarterComponent },
  { path: 'examples', component: ExamplesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemosRoutingModule { }
