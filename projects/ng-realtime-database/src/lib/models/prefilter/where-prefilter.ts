import {IPrefilter} from './iprefilter';

export class WherePrefilter<T> implements IPrefilter<T> {
  prefilterType = 'WherePrefilter';
  compareFunction: (x: T) => boolean;
  compareFunctionString: string;
  contextData: { [key: string]: string };

  constructor(compareFunction: (x: T) => boolean, contextData?: [string, any][]) {
    this.compareFunction = compareFunction;
    this.compareFunctionString = compareFunction.toString();

    if (contextData) {
      this.contextData = {};

      contextData.forEach(([key, value]: [string, any]) => {
        this.contextData[key] = JSON.stringify(value);
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
