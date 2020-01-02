import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {QueryComponent} from './query/query.component';
import {ManageComponent} from './manage/manage.component';
import {PrefilterComponent} from './prefilter/prefilter.component';
import {WhereComponent} from './where/where.component';
import {OrderComponent} from './order/order.component';
import {LimitComponent} from './limit/limit.component';
import {SelectComponent} from './select/select.component';
import {CountComponent} from './count/count.component';
import {EventsComponent} from './events/events.component';
import {QueryFunctionComponent} from './query-function/query-function.component';
import {ChangesComponent} from './changes/changes.component';
import {IncludeComponent} from './include/include.component';
import {ClassTransformerComponent} from './class-transformer/class-transformer.component';


const routes: Routes = [
  { path: 'query', component: QueryComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'prefilter', component: PrefilterComponent },
  { path: 'where', component: WhereComponent },
  { path: 'order', component: OrderComponent },
  { path: 'limit', component: LimitComponent },
  { path: 'select', component: SelectComponent },
  { path: 'count', component: CountComponent },
  { path: 'changes', component: ChangesComponent },
  { path: 'events', component: EventsComponent },
  { path: 'query-function', component: QueryFunctionComponent },
  { path: 'include', component: IncludeComponent },
  { path: 'class-transformer', component: ClassTransformerComponent },
  { path: '', redirectTo: 'query', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataRoutingModule { }
