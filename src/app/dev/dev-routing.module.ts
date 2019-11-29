import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {SapphireAuthGuard} from 'ng-sapphiredb';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [ SapphireAuthGuard ] },
      { path: 'message', loadChildren: () => import('./message/message.module').then(m => m.MessageModule), canActivate: [SapphireAuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRoutingModule { }
