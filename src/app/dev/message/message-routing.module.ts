import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import { RealtimeAuthGuard } from 'ng-realtime-database';

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [ RealtimeAuthGuard ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
