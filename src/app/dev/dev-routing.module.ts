import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {RealtimeAuthGuard} from 'ng-realtime-database';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [ RealtimeAuthGuard ] },
      { path: 'message', loadChildren: () => import('./message/message.module').then(m => m.MessageModule), canActivate: [RealtimeAuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRoutingModule { }
