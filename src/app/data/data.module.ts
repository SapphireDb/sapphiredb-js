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
import { InfoComponent } from './info/info.component';
import { EventsComponent } from './events/events.component';
import { QueryFunctionComponent } from './query-function/query-function.component';
import { ChangesComponent } from './changes/changes.component';
import { IncludeComponent } from './include/include.component';


@NgModule({
  declarations: [QueryComponent, ManageComponent, PrefilterComponent, WhereComponent, OrderComponent, LimitComponent, SelectComponent, CountComponent, InfoComponent, EventsComponent, QueryFunctionComponent, ChangesComponent, IncludeComponent],
  imports: [
    SharedModule,
    DataRoutingModule
  ]
})
export class DataModule { }
