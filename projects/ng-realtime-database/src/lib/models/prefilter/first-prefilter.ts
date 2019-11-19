import {IPrefilter} from './iprefilter';

export class FirstPrefilter<T> implements IPrefilter<T, T> {
  prefilterType = 'FirstPrefilter';

  execute(values: T[]) {
    return values[0];
  }

  public hash() {
    return `${this.prefilterType}`;
  }
}
