import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {NetCoreComponent} from './net-core/net-core.component';
import {AngularComponent} from './angular/angular.component';
import {ConnectionTypesComponent} from './connection-types/connection-types.component';


const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'net-core', component: NetCoreComponent },
  { path: 'angular', component: AngularComponent },
  { path: 'connection-types', component: ConnectionTypesComponent },
  { path: '', pathMatch: 'full', redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartRoutingModule { }
