import {NgModule} from '@angular/core';

import {SecurityRoutingModule} from './security-routing.module';
import {AuthenticationComponent} from './authentication/authentication.component';
import {SharedModule} from '../shared.module';
import { NetCoreComponent } from './net-core/net-core.component';
import { AngularComponent } from './angular/angular.component';
import { ManageComponent } from './manage/manage.component';
import { AuthorizationComponent } from './authorization/authorization.component';
import { ModelAttributesComponent } from './model-attributes/model-attributes.component';


@NgModule({
  declarations: [AuthenticationComponent, NetCoreComponent, AngularComponent, ManageComponent, AuthorizationComponent, ModelAttributesComponent],
  imports: [
    SharedModule,
    SecurityRoutingModule
  ]
})
export class SecurityModule { }
