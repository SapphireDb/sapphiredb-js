import {ArrayHelper} from '../../helper/array-helper';
import {OrderByPrefilter} from './order-by-prefilter';
import {SortDirection} from '../../models/types';

export class ThenOrderByPrefilter<T> extends OrderByPrefilter<T> {
  override prefilterType = 'ThenOrderByPrefilter';

  constructor(property: keyof T, direction: SortDirection = SortDirection.ascending) {
    super(property, direction);
  }

  public override execute(values: T[]) {
    return ArrayHelper.thenOrderBy(values, x => x[this.property], this.descending);
  }
}
