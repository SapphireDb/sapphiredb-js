import {NgModule} from '@angular/core';

import {SecurityRoutingModule} from './security-routing.module';
import {SharedModule} from '../shared.module';
import { NetCoreComponent } from './net-core/net-core.component';

import { GeneralComponent } from './general/general.component';
import { QueryAuthComponent } from './query-auth/query-auth.component';
import { CurrentUserComponent } from './current-user/current-user.component';
import {UserStateService} from './user-state.service';
import { UpdateAuthComponent } from './update-auth/update-auth.component';
import { CreateAuthComponent } from './create-auth/create-auth.component';
import { RemoveAuthComponent } from './remove-auth/remove-auth.component';
import { ExecuteComponent } from './execute/execute.component';


@NgModule({
  declarations: [NetCoreComponent, GeneralComponent, QueryAuthComponent, CurrentUserComponent, UpdateAuthComponent, CreateAuthComponent, RemoveAuthComponent, ExecuteComponent],
  imports: [
    SharedModule,
    SecurityRoutingModule
  ],
  providers: [
    UserStateService
  ]
})
export class SecurityModule { }
