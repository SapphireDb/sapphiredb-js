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
import {REALTIME_DATABASE_OPTIONS, RealtimeDatabaseModule, RealtimeDatabaseOptions} from 'ng-realtime-database';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {HighlightModule} from 'ngx-highlightjs';
import {SharedModule} from './shared.module';
import {LegalDisclosureComponent} from './shared/legal-disclosure/legal-disclosure.component';
import {PrivacyComponent} from './shared/privacy/privacy.component';
import { ServiceWorkerModule } from '@angular/service-worker';

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

export function createRealtimeOptions(): RealtimeDatabaseOptions {
  return {
    // serverBaseUrl: environment.serverBaseUrl,
    loginRedirect: 'dev/account/login',
    unauthorizedRedirect: 'dev/account/unauthorized',
    apiSecret: 'pw1234',
    apiKey: 'webapp',
    connectionType: <any>(localStorage.getItem('connectionType') || 'websocket')
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LegalDisclosureComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RealtimeDatabaseModule,
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
    AppRoutingModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: REALTIME_DATABASE_OPTIONS, useFactory: createRealtimeOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
