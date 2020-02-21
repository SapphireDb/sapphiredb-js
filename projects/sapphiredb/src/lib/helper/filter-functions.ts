// @dynamic
export class FilterFunctions {
  static comparePrimaryKeysFunction(primaryKeys: string[], newValue: any) {
    return (currentValue) => {
      let result = 0;

      primaryKeys.forEach(key => {
        if (currentValue[key] != null && newValue[key] != null && currentValue[key] === newValue[key]) {
          result++;
        }
      });

      return result === primaryKeys.length;
    };
  }
}
