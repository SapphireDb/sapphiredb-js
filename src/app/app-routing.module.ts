import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LegalDisclosureComponent} from './shared/legal-disclosure/legal-disclosure.component';
import {PrivacyComponent} from './shared/privacy/privacy.component';

const routes: Routes = [
  { path: 'start', loadChildren: () => import('./start/start.module').then(m => m.StartModule) },
  { path: 'data', loadChildren: () => import('./data/data.module').then(m => m.DataModule) },
  { path: 'security', loadChildren: () => import('./security/security.module').then(m => m.SecurityModule) },
  { path: 'actions', loadChildren: () => import('./actions/actions.module').then(m => m.ActionsModule) },
  { path: 'messaging', loadChildren: () => import('./messaging/messaging.module').then(m => m.MessagingModule) },
  { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule) },
  { path: 'demos', loadChildren: () => import('./demos/demos.module').then(m => m.DemosModule) },

  { path: 'dev', loadChildren: () => import('./dev/dev.module').then(m => m.DevModule) },

  { path: 'legal-details', component: LegalDisclosureComponent },
  { path: 'privacy', component: PrivacyComponent },

  { path: '**', redirectTo: 'start', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
