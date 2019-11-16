import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RealtimeAuthGuard} from 'ng-realtime-database';

const routes: Routes = [
  { path: 'start', loadChildren: () => import('./start/start.module').then(m => m.StartModule) },
  { path: 'data', loadChildren: () => import('./data/data.module').then(m => m.DataModule) },
  { path: 'security', loadChildren: () => import('./security/security.module').then(m => m.SecurityModule) },
  { path: 'actions', loadChildren: () => import('./actions/actions.module').then(m => m.ActionsModule) },
  { path: 'messaging', loadChildren: () => import('./messaging/messaging.module').then(m => m.MessagingModule) },
  { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule) },

  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [ RealtimeAuthGuard ] },
  { path: 'account', loadChildren: () =>  import('./account/account.module').then(m => m.AccountModule) },
  { path: 'message', loadChildren: () => import('./message/message.module').then(m => m.MessageModule)/*, canActivate: [AuthGuard]*/ },

  { path: '', redirectTo: 'start', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
