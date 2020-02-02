import {NgModule} from '@angular/core';
import {SAPPHIRE_DB_OPTIONS, SapphireDbService} from './sapphire-db.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    SapphireDbService,
    { provide: SAPPHIRE_DB_OPTIONS, useValue: null },
  ]
})
export class SapphireDbModule {}
