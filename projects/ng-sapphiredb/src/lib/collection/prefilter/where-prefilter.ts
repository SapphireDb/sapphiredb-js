import {IPrefilter} from './iprefilter';
import {ConditionType} from '../../helper/condition-types';

export class WherePrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'WherePrefilter';
  conditions: ConditionType<T>;

  constructor(conditions: ConditionType<T>) {
    this.conditions = conditions;
  }

  public execute(values: T[]) {
    return values;
  }

  public hash() {
    return `${this.prefilterType},${JSON.stringify(this.conditions)}`;
  }
}
