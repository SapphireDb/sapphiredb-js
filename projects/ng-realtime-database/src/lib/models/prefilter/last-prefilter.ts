import {IPrefilter} from './iprefilter';

export class LastPrefilter<T> implements IPrefilter<T, T> {
  prefilterType = 'LastPrefilter';

  execute(values: T[]) {
    return values[values.length - 1];
  }

  public hash() {
    return `${this.prefilterType}`;
  }
}
