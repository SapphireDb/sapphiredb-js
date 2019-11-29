import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import { SapphireAuthGuard } from 'ng-sapphiredb';

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [ SapphireAuthGuard ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
