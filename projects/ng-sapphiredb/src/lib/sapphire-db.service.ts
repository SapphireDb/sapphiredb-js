import {Inject, Injectable, InjectionToken, NgZone, Optional} from '@angular/core';
import {SapphireDbOptions, SapphireDb, SapphireClassTransformer} from 'sapphiredb';

export const SAPPHIRE_DB_OPTIONS = new InjectionToken<SapphireDbOptions>('sapphire-db.options');

@Injectable()
export class SapphireDbService extends SapphireDb {
  constructor(@Inject(SAPPHIRE_DB_OPTIONS) options: SapphireDbOptions, @Optional() classTransformer: SapphireClassTransformer,
              private ngZone: NgZone) {
    super(options, classTransformer, (executeCode: () => void) => {
      this.ngZone.run(executeCode);
    });
  }
}
