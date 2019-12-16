import {IPrefilter} from './iprefilter';

export type CompareOperationType = '=='|'Contains'|'StartsWith'|'EndsWith';

export class WherePrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'WherePrefilter';
  conditions: any[];

  constructor(conditionBuilder: (builder: ConditionBuilder<T>) => ConditionBuilder<T>|ConditionStep<T>) {
    const conditionsRaw = conditionBuilder(new ConditionBuilder<T>());
    this.conditions = conditionsRaw instanceof ConditionBuilder ? conditionsRaw.conditions : conditionsRaw.builder.conditions;
  }

  public execute(values: T[]) {
    return values;
  }

  public hash() {
    return `${this.prefilterType},${JSON.stringify(this.conditions)}`;
  }
}

export class ConditionBuilder<T> {
  public conditions = [];

  condition(property: keyof T, compare: CompareOperationType, value: any): ConditionStep<T> {
    this.conditions.push([property, compare, value]);
    return new ConditionStep<T>(this);
  }
}

export class ConditionStep<T> {

  constructor(public builder: ConditionBuilder<T>) { }

  and(): ConditionBuilder<T> {
    this.builder.conditions.push('and');
    return this.builder;
  }

  or(): ConditionBuilder<T> {
    this.builder.conditions.push('or');
    return this.builder;
  }

  group(): ConditionStep<T> {
    for (let i = this.builder.conditions.length - 1; i >= 0 && i < this.builder.conditions.length; i--) {
      if (i - 2 >= 0 && this.builder.conditions[i - 2][0] instanceof Array || i === 0) {
        const newGroup = this.builder.conditions.splice(i);
        this.builder.conditions.push(newGroup);
        break;
      }
    }

    return this;
  }
}
