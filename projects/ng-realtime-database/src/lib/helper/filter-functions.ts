import {IPrefilter} from '../collection/prefilter/iprefilter';
import {CollectionData} from '../collection/collection-data';

// @dynamic
export class FilterFunctions {
  static comparePrimaryKeysFunction(primaryKeys: string[], newValue: any) {
    return (currentValue) => {
      let result = 0;

      primaryKeys.forEach(key => {
        if (currentValue[key] === newValue[key]) {
          result++;
        }
      });

      return result === primaryKeys.length;
    };
  }
}
