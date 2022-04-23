import {IPrefilter} from './iprefilter';

export class FirstPrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'FirstPrefilter';

  execute(values: T[]) {
    return values.slice(0, 1);
  }

  public hash() {
    return `${this.prefilterType}`;
  }
}
