import {NgModule} from '@angular/core';
import {RealtimeDatabase} from './realtime-database.service';
import {RealtimeDatabaseOptions} from './models/realtime-database-options';
import {WebsocketService} from './websocket.service';
import {CollectionInformationService} from './collection-information.service';
import {CollectionManagerService} from './collection-manager.service';
import {RealtimeAuthGuard} from './realtime-auth.guard';
import {CollectionValuesService} from './collection-values.service';
import {ConnectionManagerService} from './connection/connection-manager.service';

const defaultOptions: RealtimeDatabaseOptions = {
  serverBaseUrl: `${location.hostname}:${location.port}`,
  useSsl: location.protocol === 'https'
};

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    RealtimeDatabase,
    ConnectionManagerService,
    WebsocketService,
    CollectionInformationService,
    CollectionManagerService,
    CollectionValuesService,
    { provide: 'realtimedatabase.options', useValue: defaultOptions},
    RealtimeAuthGuard
  ]
})
export class RealtimeDatabaseModule {
  static config(options: RealtimeDatabaseOptions) {
    return {
      ngModule: RealtimeDatabaseModule,
      providers: [
        { provide: 'realtimedatabase.options', useValue: options }
      ]
    };
  }
}
