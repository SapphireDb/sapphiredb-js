import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {SyncComponent} from './sync/sync.component';
import {ConnectionTypesComponent} from './connection-types/connection-types.component';
import {FluentComponent} from './fluent/fluent.component';

const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'sync', component: SyncComponent },
  { path: 'connection-types', component: ConnectionTypesComponent },
  { path: 'fluent', component: FluentComponent },
  { path: '', pathMatch: 'full', redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
