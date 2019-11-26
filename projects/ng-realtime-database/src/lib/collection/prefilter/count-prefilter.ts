import {IPrefilter} from './iprefilter';

export class CountPrefilter<T> implements IPrefilter<T, number> {
  prefilterType = 'CountPrefilter';

  execute(values: T[]) {
    return values.length;
  }

  public hash() {
    return `${this.prefilterType}`;
  }
}
