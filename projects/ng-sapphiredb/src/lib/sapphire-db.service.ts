import {Inject, Injectable, InjectionToken, NgZone, Optional} from '@angular/core';
import {SapphireDbOptions, SapphireDb as SapphireDbBase, SapphireClassTransformer} from 'sapphiredb';

export const SAPPHIRE_DB_OPTIONS = new InjectionToken<SapphireDbOptions>('sapphire-db.options');

@Injectable()
export class SapphireDb extends SapphireDbBase {
  constructor(@Inject(SAPPHIRE_DB_OPTIONS) options: SapphireDbOptions, @Optional() classTransformer: SapphireClassTransformer,
              private ngZone: NgZone) {
    super(options, classTransformer, (executeCode: () => void) => {
      this.ngZone.run(executeCode);
    });
  }
}
