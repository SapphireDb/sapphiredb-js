import {IPrefilter} from './iprefilter';
import {ConditionType} from '../../helper/condition-types';
import {FilterFunctions} from '../../helper/filter-functions';

export class WherePrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'WherePrefilter';
  conditions: ConditionType<T>;

  private conditionFunction: (value: T) => boolean;

  constructor(conditions: ConditionType<T>) {
    this.conditions = conditions;
    this.conditionFunction = FilterFunctions.convertConditionParts(this.conditions);
  }

  public execute(values: T[]) {
    return values.filter(this.conditionFunction);
  }

  public hash() {
    return `${this.prefilterType},${JSON.stringify(this.conditions)}`;
  }
}
