import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main/main.component';
import {NetCoreComponent} from './net-core/net-core.component';
import {AngularComponent} from './angular/angular.component';
import {ImplementationsComponent} from './implementations/implementations.component';
import {ContributionComponent} from './contribution/contribution.component';
import {SponsorsComponent} from './sponsors/sponsors.component';
import {JsComponent} from './js/js.component';


const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'net-core', component: NetCoreComponent },
  { path: 'angular', component: AngularComponent },
  { path: 'js', component: JsComponent },
  { path: 'implementations', component: ImplementationsComponent },
  { path: 'contribution', component: ContributionComponent },
  { path: 'sponsors', component: SponsorsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartRoutingModule { }
