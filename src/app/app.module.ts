import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import powershell from 'highlight.js/lib/languages/powershell';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import less from 'highlight.js/lib/languages/less';
import csharp from 'highlight.js/lib/languages/cs';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import { SapphireDbOptions, SapphireClassTransformer, ClassType, SapphireStorage} from 'sapphiredb';
import { SAPPHIRE_DB_OPTIONS, SapphireDbModule } from 'ng-sapphiredb';
import {ReactiveFormsModule} from '@angular/forms';
import {environment} from '../environments/environment';
import {HighlightModule} from 'ngx-highlightjs';
import {SharedModule} from './shared.module';
import {LegalDisclosureComponent} from './shared/legal-disclosure/legal-disclosure.component';
import {PrivacyComponent} from './shared/privacy/privacy.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {classToPlain, plainToClass} from 'class-transformer';
import {Observable, of} from 'rxjs';
import {SapphireLocalStorage} from '../../projects/sapphiredb/src/lib/helper/sapphire-storage';

export function hljsLanguages() {
  return [
    {name: 'typescript', func: typescript},
    {name: 'html', func: xml},
    {name: 'ps', func: powershell },
    {name: 'json', func: json },
    {name: 'css', func: css },
    {name: 'less', func: less },
    {name: 'csharp', func: csharp },
  ];
}

export function createRealtimeOptions(): SapphireDbOptions {
  return {
    useSsl: environment.useSsl,
    serverBaseUrl: environment.serverBaseUrl,
    apiSecret: 'pw1234',
    apiKey: 'webapp',
    connectionType: <any>(localStorage.getItem('connectionType') || 'websocket'),
    offlineSupport: true
  };
}

export class CustomClassTransformer extends SapphireClassTransformer {
  classToPlain<T>(value: T[] | T): any {
    return classToPlain(value);
  }

  plainToClass<T>(value: any, classType: ClassType<T>): T[] | T {
    return plainToClass(classType, value);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LegalDisclosureComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'DemoClient' }),
    ReactiveFormsModule,
    SapphireDbModule,
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
    AppRoutingModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: SAPPHIRE_DB_OPTIONS, useFactory: createRealtimeOptions },
    { provide: SapphireClassTransformer, useClass: CustomClassTransformer },
    { provide: SapphireStorage, useClass: SapphireLocalStorage }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
