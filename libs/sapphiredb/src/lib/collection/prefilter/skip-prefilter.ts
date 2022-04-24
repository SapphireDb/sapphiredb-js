import {TakePrefilter} from './take-prefilter';

export class SkipPrefilter<T> extends TakePrefilter<T> {
  override prefilterType = 'SkipPrefilter';

  constructor(number: number) {
    super(number);
  }
}
