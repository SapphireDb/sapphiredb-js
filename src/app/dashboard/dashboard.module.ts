import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import {FormsModule} from '@angular/forms';
import { TestComponent } from './test/test.component';
import { AuthComponent } from './auth/auth.component';
import { CollectionTestComponent } from './collection-test/collection-test.component';
import { PrefiltersComponent } from './prefilters/prefilters.component';
import {NgMetro4Module} from 'ng-metro4';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    NgMetro4Module
  ],
  declarations: [MainComponent, TestComponent, AuthComponent, CollectionTestComponent, PrefiltersComponent]
})
export class DashboardModule { }
