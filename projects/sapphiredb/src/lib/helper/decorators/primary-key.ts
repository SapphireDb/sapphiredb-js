import {DecoratorHelper} from '../decorator-helper';

// @dynamic
export function primaryKey() {
  return function(target: any, property: string): void {
    DecoratorHelper.addPrimaryKey(target, property);
  };
}

