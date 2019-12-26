import {NgModule} from '@angular/core';
import {SapphireDb} from './sapphire-db.service';
import {SAPPHIRE_DB_OPTIONS, SapphireDbOptions} from './models/sapphire-db-options';
import {CollectionInformationService} from './collection/services/collection-information.service';
import {CollectionManagerService} from './collection/services/collection-manager.service';
import {SapphireAuthGuard} from './modules/auth/sapphire-auth.guard';
import {ConnectionManagerService} from './connection/services/connection-manager.service';
import {HttpClientModule} from '@angular/common/http';

const defaultOptions: SapphireDbOptions = {
  serverBaseUrl: `${location.hostname}:${location.port}`,
  useSsl: location.protocol === 'https'
};

@NgModule({
  imports: [
    HttpClientModule,
  ],
  declarations: [],
  providers: [
    SapphireDb,
    ConnectionManagerService,
    CollectionInformationService,
    CollectionManagerService,
    { provide: SAPPHIRE_DB_OPTIONS, useValue: defaultOptions },
    SapphireAuthGuard
  ],
  exports: [
    HttpClientModule
  ]
})
export class SapphireDbModule {}
