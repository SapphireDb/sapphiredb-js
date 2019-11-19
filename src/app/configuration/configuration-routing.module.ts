import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {NlbComponent} from './nlb/nlb.component';


const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'nlb', component: NlbComponent },
  { path: '', pathMatch: 'full', redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
