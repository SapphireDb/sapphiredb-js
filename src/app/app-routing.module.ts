import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RealtimeAuthGuard} from 'ng-realtime-database';

const routes: Routes = [
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate: [ RealtimeAuthGuard ] },
  { path: 'account', loadChildren: './account/account.module#AccountModule' },
  { path: 'message', loadChildren: './message/message.module#MessageModule'/*, canActivate: [AuthGuard]*/ },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
