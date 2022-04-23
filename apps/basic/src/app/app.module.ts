import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {SAPPHIRE_DB_OPTIONS, SapphireDbModule} from 'ng-sapphiredb';
import {SapphireDbOptions} from 'sapphiredb';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SapphireDbModule
  ],
  providers: [
    {
      provide: SAPPHIRE_DB_OPTIONS,
      useValue: {
        serverBaseUrl: 'localhost:5297',
        useSsl: false
      } as SapphireDbOptions
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
