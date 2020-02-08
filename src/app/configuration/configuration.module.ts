import {NgModule} from '@angular/core';

import {ConfigurationRoutingModule} from './configuration-routing.module';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../shared.module';
import {FormsModule} from '@angular/forms';
import {SyncComponent} from './sync/sync.component';
import {ConnectionTypesComponent} from './connection-types/connection-types.component';
import { FluentComponent } from './fluent/fluent.component';


@NgModule({
  declarations: [MainComponent, SyncComponent, ConnectionTypesComponent, FluentComponent],
  imports: [
    SharedModule,
    FormsModule,
    ConfigurationRoutingModule
  ]
})
export class ConfigurationModule { }
