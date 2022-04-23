export type CompareOperationType =
  '=='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'Contains'
  | 'ContainsCaseInsensitive'
  | 'StartsWith'
  | 'StartsWithCaseInsensitive'
  | 'EndsWith'
  | 'EndsWithCaseInsensitive'
  | 'InArray'
  | 'ArrayContains'
  | 'NotEqualIgnoreCase'
  | 'EqualIgnoreCase';

export type BaseConditionType<T> = [keyof T, CompareOperationType, any];
export type CombineType = 'and' | 'or';
export type CompoundConditionType<T> = BaseConditionType<T> | CombineType;
export type ConditionType<T> = (CompoundConditionType<T>[] | CompoundConditionType<T>)[] | BaseConditionType<T>;
