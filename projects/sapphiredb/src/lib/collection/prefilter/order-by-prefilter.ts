import {IPrefilter} from './iprefilter';
import {ArrayHelper} from '../../helper/array-helper';
import {SortDirection} from '../../models/types';

export class OrderByPrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'OrderByPrefilter';
  property: keyof T;
  descending: boolean;

  constructor(property: keyof T, direction: SortDirection = SortDirection.ascending) {
    this.property = property;
    this.descending = direction === SortDirection.descending;
  }

  public execute(values: T[]) {
    return ArrayHelper.orderBy(values, x => x[this.property], this.descending);
  }

  public hash() {
    return `${this.prefilterType},${this.property},${this.descending}}`;
  }
}
