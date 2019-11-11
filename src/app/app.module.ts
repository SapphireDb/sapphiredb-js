import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import powershell from 'highlight.js/lib/languages/powershell';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import csharp from 'highlight.js/lib/languages/cs';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RealtimeDatabaseModule} from 'ng-realtime-database';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {Angular2PromiseButtonModule} from 'angular2-promise-buttons';
import {environment} from '../environments/environment';
import {HighlightModule} from 'ngx-highlightjs';
import {SharedModule} from './shared.module';

export function hljsLanguages() {
  return [
    {name: 'typescript', func: typescript},
    {name: 'html', func: xml},
    {name: 'ps', func: powershell },
    {name: 'json', func: json },
    {name: 'css', func: css },
    {name: 'csharp', func: csharp },
  ];
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RealtimeDatabaseModule.config({
      serverBaseUrl: environment.serverBaseUrl,
      loginRedirect: 'account/login',
      unauthorizedRedirect: 'account/unauthorized',
      apiSecret: 'pw1234',
      apiKey: 'webapp',
      connectionType: 'websocket'
    }),
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
    AppRoutingModule,
    Angular2PromiseButtonModule.forRoot(),
    SharedModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
