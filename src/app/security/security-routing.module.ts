import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthenticationComponent} from './authentication/authentication.component';
import {NetCoreComponent} from './net-core/net-core.component';
import {AngularComponent} from './angular/angular.component';
import {ManageComponent} from './manage/manage.component';
import {AuthorizationComponent} from './authorization/authorization.component';
import {ModelAttributesComponent} from './model-attributes/model-attributes.component';

const routes: Routes = [
  { path: 'authentication', component: AuthenticationComponent },
  { path: 'net-core', component: NetCoreComponent },
  { path: 'angular', component: AngularComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'authorization', component: AuthorizationComponent },
  { path: 'model-attributes', component: ModelAttributesComponent },
  { path: '', pathMatch: 'full', redirectTo: 'authentication' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
