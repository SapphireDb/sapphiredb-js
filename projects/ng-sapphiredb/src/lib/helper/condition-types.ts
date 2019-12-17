export type CompareOperationType = '=='|'!='|'<'|'>'|'<='|'>='|'Contains'|'StartsWith'|'EndsWith';
export type BaseConditionType<T> = [keyof T, CompareOperationType, any];
export type CombineType = 'and'|'or';
export type CompoundConditionType<T> = BaseConditionType<T>|CombineType;
export type ConditionType<T> = (CompoundConditionType<T>[]|CompoundConditionType<T>)[]|BaseConditionType<T>;
