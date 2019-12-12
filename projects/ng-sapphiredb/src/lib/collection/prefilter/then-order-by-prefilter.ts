import {IPrefilter} from './iprefilter';
import {ArrayHelper} from '../../helper/array-helper';
import {OrderByPrefilter} from './order-by-prefilter';

export class ThenOrderByPrefilter<T> extends OrderByPrefilter<T> {
  prefilterType = 'ThenOrderByPrefilter';

  constructor(property: keyof T, descending: boolean = false) {
    super(property, descending);
  }

  public execute(values: T[]) {
    return ArrayHelper.thenOrderBy(values, x => x[this.property], this.descending);
  }
}
