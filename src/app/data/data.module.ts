import {NgModule} from '@angular/core';

import {DataRoutingModule} from './data-routing.module';
import {SharedModule} from '../shared.module';
import {QueryComponent} from './query/query.component';
import { ManageComponent } from './manage/manage.component';
import { PrefilterComponent } from './prefilter/prefilter.component';
import { WhereComponent } from './where/where.component';
import { OrderComponent } from './order/order.component';
import { LimitComponent } from './limit/limit.component';
import { SelectComponent } from './select/select.component';
import { CountComponent } from './count/count.component';


@NgModule({
  declarations: [QueryComponent, ManageComponent, PrefilterComponent, WhereComponent, OrderComponent, LimitComponent, SelectComponent, CountComponent],
  imports: [
    SharedModule,
    DataRoutingModule
  ]
})
export class DataModule { }