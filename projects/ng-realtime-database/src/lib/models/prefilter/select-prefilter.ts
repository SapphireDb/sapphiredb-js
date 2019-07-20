import {IPrefilter} from './iprefilter';

export class SelectPrefilter<T> implements IPrefilter<T, any[]> {
  prefilterType = 'SelectPrefilter';
  selectFunction: (x: T, contextData?: any[]) => any;
  selectFunctionString: string;
  contextData: any[];

  constructor(selectFunction: (x: T, contextData?: any[]) => any, contextData?: any[]) {
    this.selectFunction = selectFunction;
    this.selectFunctionString = selectFunction.toString();

    if (contextData) {
      this.contextData = contextData.map(v => {
        return JSON.parse(JSON.stringify(v));
      });
    }
  }

  public execute(values: T[]) {
    return values.map(x => this.selectFunction(x, this.contextData));
  }

  public hash() {
    return `${this.prefilterType},${this.selectFunctionString},${JSON.stringify(this.contextData)}`;
  }
}
