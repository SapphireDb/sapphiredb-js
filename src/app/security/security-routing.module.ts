import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthenticationComponent} from './authentication/authentication.component';
import {NetCoreComponent} from './net-core/net-core.component';
import {AngularComponent} from './angular/angular.component';
import {ManageComponent} from './manage/manage.component';
import {AuthorizationComponent} from './authorization/authorization.component';
import {ModelAttributesComponent} from './model-attributes/model-attributes.component';
import {AttributesComponent} from './attributes/attributes.component';
import {ActionAttributesComponent} from './action-attributes/action-attributes.component';
import {ConnectionManagementComponent} from './connection-management/connection-management.component';

const routes: Routes = [
  { path: 'authentication', component: AuthenticationComponent },
  { path: 'net-core', component: NetCoreComponent },
  { path: 'angular', component: AngularComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'authorization', component: AuthorizationComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'model-attributes', component: ModelAttributesComponent },
  { path: 'action-attributes', component: ActionAttributesComponent },
  { path: 'connection-management', component: ConnectionManagementComponent },
  { path: '', pathMatch: 'full', redirectTo: 'authentication' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
