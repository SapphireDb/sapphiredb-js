import {NgModule} from '@angular/core';
import {SAPPHIRE_DB_OPTIONS, SapphireDb} from './sapphire-db.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    SapphireDb,
    { provide: SAPPHIRE_DB_OPTIONS, useValue: null },
  ]
})
export class SapphireDbModule {}
