import {Inject, Injectable, InjectionToken, NgZone, Optional} from '@angular/core';
import {SapphireDbOptions, SapphireDb, SapphireClassTransformer, SapphireStorage} from 'sapphiredb';

export const SAPPHIRE_DB_OPTIONS = new InjectionToken<SapphireDbOptions>('sapphire-db.options');
export const SAPPHIRE_DB_STARTUP_TOKEN = new InjectionToken<string>('sapphire-db.startup-token');

@Injectable()
export class SapphireDbService extends SapphireDb {
  constructor(@Inject(SAPPHIRE_DB_OPTIONS) options: SapphireDbOptions,
              @Optional() storage: SapphireStorage,
              @Optional() classTransformer: SapphireClassTransformer,
              private ngZone: NgZone,
              @Optional() @Inject(SAPPHIRE_DB_STARTUP_TOKEN) startupToken: string) {
    super(options, storage, classTransformer, (executeCode: () => void) => {
      this.ngZone.run(executeCode);
    }, startupToken);
  }
}
