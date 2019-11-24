import {NgModule} from '@angular/core';
import {RealtimeDatabase} from './realtime-database.service';
import {REALTIME_DATABASE_OPTIONS, RealtimeDatabaseOptions} from './models/realtime-database-options';
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
    CollectionInformationService,
    CollectionManagerService,
    CollectionValuesService,
    { provide: REALTIME_DATABASE_OPTIONS, useValue: defaultOptions },
    RealtimeAuthGuard
  ]
})
export class RealtimeDatabaseModule {
  // static config(options: (RealtimeDatabaseOptions|{ builder: () => RealtimeDatabaseOptions })) {
  //   let optionsObject: RealtimeDatabaseOptions;
  //
  //   if (!!(<any>options).builder && typeof (<any>options).builder === 'function') {
  //     optionsObject = (<any>options).builder();
  //   } else {
  //     optionsObject = <RealtimeDatabaseOptions>options;
  //   }
  //
  //   return {
  //     ngModule: RealtimeDatabaseModule,
  //     providers: [
  //       { provide: 'realtimedatabase.options', useValue: optionsObject }
  //     ]
  //   };
  // }
}
