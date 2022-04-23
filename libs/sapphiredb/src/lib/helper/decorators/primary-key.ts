import {DecoratorHelper} from '../decorator-helper';

// @dynamic
export function PrimaryKey() {
  return function(target: any, property: string): void {
    DecoratorHelper.addPrimaryKey(target, property);
  };
}

