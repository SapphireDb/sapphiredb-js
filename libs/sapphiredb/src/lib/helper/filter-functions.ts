import {BaseConditionType, ConditionType} from './condition-types';

// @dynamic
export class FilterFunctions {
  static comparePrimaryKeysFunction<T>(primaryKeys: string[], newValue: { [key: string]: unknown }) {
    return (currentValue: T) => {
      let result = 0;

      primaryKeys.forEach(key => {
        if (
          (currentValue as unknown as { [key: string]: unknown })[key] != null &&
          newValue[key] != null &&
          (currentValue as unknown as { [key: string]: unknown })[key] === newValue[key]
        ) {
          result++;
        }
      });

      return result === primaryKeys.length;
    };
  }

  static convertConditionParts<T>(conditionsParts: ConditionType<T>): (value: T) => boolean {
    let prevFunction: ((value: T) => boolean) | undefined = undefined;
    let completeFunction: ((value: T) => boolean) | undefined = undefined;

    if (conditionsParts[0] instanceof Array) {
      for (let i = 0; i < conditionsParts.length; i++) {
        const combineOperatorValue = conditionsParts[i];

        if (typeof combineOperatorValue === 'string') {
          if (!prevFunction) {
            prevFunction = this.convertConditionParts(conditionsParts[i - 1]);
          } else {
            prevFunction = completeFunction;
          }

          const nextFunction = this.convertConditionParts(conditionsParts[i + 1]);

          if (combineOperatorValue === 'and') {
            completeFunction = (v) => (prevFunction?.(v) && nextFunction(v)) as boolean;
          } else {
            completeFunction = (v) => prevFunction?.(v) || nextFunction(v);
          }
        }
      }

      if (!completeFunction) {
        completeFunction = this.convertConditionParts(conditionsParts[0]);
      }

      return completeFunction;
    }
    return this.createCompareFunction(<BaseConditionType<any>>conditionsParts);

    throw new Error('Wrong order of conditions');
  }

  private static createCompareFunction(condition: BaseConditionType<any>): (value: any) => boolean {
    const compareProperty = condition[0];

    if (!compareProperty) {
      return () => true;
    }

    const compareOperation = condition[1];
    const compareValue = condition[2];

    switch (compareOperation) {
      case 'Contains':
        return (value) => value[compareProperty].contains(compareValue);
      case 'ContainsCaseInsensitive':
        return (value) => value[compareProperty].toLowerCase().contains(compareValue.toLowerCase());
      case 'StartsWith':
        return (value) => value[compareProperty].startsWith(compareValue);
      case 'StartsWithCaseInsensitive':
        return (value) => value[compareProperty].toLowerCase().startsWith(compareValue.toLowerCase());
      case 'EndsWith':
        return (value) => value[compareProperty].endsWith(compareValue);
      case 'EndsWithCaseInsensitive':
        return (value) => value[compareProperty].toLowerCase().endsWith(compareValue.toLowerCase());
      case 'ArrayContains':
        return (value) => (<any[]>value[compareProperty]).indexOf(compareValue) !== -1;
      case 'InArray':
        return (value) =>  (<any[]>compareValue).indexOf(value[compareProperty]) !== -1;
      case 'NotEqualIgnoreCase':
        return (value) =>  value[compareProperty].toLowerCase() !== compareValue.toLowerCase();
      case 'EqualIgnoreCase':
        return (value) =>  value[compareProperty].toLowerCase() === compareValue.toLowerCase();
      case '!=':
        return (value) =>  value[compareProperty] !== compareValue;
      case '<':
        return (value) =>  value[compareProperty] < compareValue;
      case '<=':
        return (value) =>  value[compareProperty] <= compareValue;
      case '>':
        return (value) =>  value[compareProperty] > compareValue;
      case '>=':
        return (value) =>  value[compareProperty] >= compareValue;
      case '==':
      default:
        return (value) =>  value[compareProperty] === compareValue;
    }
  }
}
