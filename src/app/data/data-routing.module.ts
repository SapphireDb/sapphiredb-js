import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {QueryComponent} from './query/query.component';
import {ManageComponent} from './manage/manage.component';


const routes: Routes = [
  { path: 'query', component: QueryComponent },
  { path: 'manage', component: ManageComponent },
  { path: '', redirectTo: 'query', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataRoutingModule { }
