import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NetCoreComponent} from './net-core/net-core.component';
import {GeneralComponent} from './general/general.component';
import {QueryAuthComponent} from './query-auth/query-auth.component';
import {UpdateAuthComponent} from './update-auth/update-auth.component';
import {CreateAuthComponent} from './create-auth/create-auth.component';
import {RemoveAuthComponent} from './remove-auth/remove-auth.component';
import {ExecuteComponent} from './execute/execute.component';

const routes: Routes = [
  { path: 'general', component: GeneralComponent },
  { path: 'net-core', component: NetCoreComponent },
  { path: 'query-auth', component: QueryAuthComponent },
  { path: 'update-auth', component: UpdateAuthComponent },
  { path: 'create-auth', component: CreateAuthComponent },
  { path: 'remove-auth', component: RemoveAuthComponent },
  { path: 'action-auth', component: ExecuteComponent },
  { path: '', pathMatch: 'full', redirectTo: 'general' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
