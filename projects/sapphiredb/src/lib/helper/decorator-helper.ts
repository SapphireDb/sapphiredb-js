import {ClassType, PrimaryKeyEntry} from '../models/types';

// @dynamic
export class DecoratorHelper {
  private static primaryKeys: PrimaryKeyEntry[] = [];

  public static addPrimaryKey(type: ClassType<any>, property: string): void {
    const classType: Function = type.constructor;

    const entryIndex = this.primaryKeys.findIndex(pk => pk.type === classType);

    if (entryIndex !== -1) {
      const previousPrimaryKeys = this.primaryKeys[entryIndex].primaryKeys;
      this.primaryKeys[entryIndex].primaryKeys = [ ...previousPrimaryKeys, property ];
    } else {
      if ((<any>classType).prototype.__proto__.constructor !== Object) {
        this.primaryKeys.push({
          type: classType,
          primaryKeys: [ property, ...this.getPrimaryKeys((<any>classType).prototype.__proto__.constructor) ]
        });
      } else {
        this.primaryKeys.push({
          type: classType,
          primaryKeys: [ property ]
        });
      }
    }
  }

  public static getPrimaryKeys(type: Function): string[] {
    const entryIndex = this.primaryKeys.findIndex(pk => pk.type === type);

    if (entryIndex === -1) {
      if ((<any>type).prototype.__proto__.constructor !== Object) {
        return this.getPrimaryKeys((<any>type).prototype.__proto__.constructor);
      }

      return [];
    }

    return this.primaryKeys[entryIndex].primaryKeys;
  }
}
