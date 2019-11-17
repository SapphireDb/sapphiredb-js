import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from '../auth.guard';
import {ManageComponent} from './manage/manage.component';
import {ConnectionsComponent} from './connections/connections.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'connections', component: ConnectionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
