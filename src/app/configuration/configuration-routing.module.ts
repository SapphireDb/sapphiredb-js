import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {NlbComponent} from './nlb/nlb.component';
import {ConnectionTypesComponent} from './connection-types/connection-types.component';


const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'nlb', component: NlbComponent },
  { path: 'connection-types', component: ConnectionTypesComponent },
  { path: '', pathMatch: 'full', redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
