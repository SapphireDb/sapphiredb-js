import {IPrefilter} from './iprefilter';
import {ArrayHelper} from '../../helper/array-helper';

export class OrderByPrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'OrderByPrefilter';
  property: keyof T;
  descending: boolean;

  constructor(property: keyof T, descending: boolean = false) {
    this.property = property;
    this.descending = descending;
  }

  public execute(values: T[]) {
    return ArrayHelper.orderBy(values, x => x[this.property], this.descending);
  }

  public hash() {
    return `${this.prefilterType},${this.property},${this.descending}}`;
  }
}
