import {IPrefilter} from './iprefilter';

export class WherePrefilter<T> implements IPrefilter<T> {
  prefilterType = 'WherePrefilter';
  compareFunction: (x: T, contextData?: any[]) => boolean;
  compareFunctionString: string;
  contextData: any[];

  constructor(compareFunction: (x: T, contextData?: any[]) => boolean, contextData: any[]) {
    this.compareFunction = compareFunction;
    this.compareFunctionString = compareFunction.toString();

    if (contextData) {
      this.contextData = contextData.map(v => {
        return JSON.parse(JSON.stringify(v));
      });
    }
  }

  public execute(values: T[]) {
    return values;
  }

  public hash() {
    return `${this.prefilterType},${this.compareFunctionString},${JSON.stringify(this.contextData)}`;
  }
}
