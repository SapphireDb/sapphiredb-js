import {NgModule} from '@angular/core';

import {DataRoutingModule} from './data-routing.module';
import {SharedModule} from '../shared.module';
import {QueryComponent} from './query/query.component';
import { ManageComponent } from './manage/manage.component';


@NgModule({
  declarations: [QueryComponent, ManageComponent],
  imports: [
    SharedModule,
    DataRoutingModule
  ]
})
export class DataModule { }
