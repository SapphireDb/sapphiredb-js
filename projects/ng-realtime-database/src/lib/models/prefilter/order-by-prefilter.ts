import {IPrefilter} from './iprefilter';
import {ArrayHelper} from '../../helper/array-helper';

export class OrderByPrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'OrderByPrefilter';
  selectFunction: (x: T, contextData?: any[]) => any;
  selectFunctionString: string;
  descending: boolean;
  contextData: any[];

  constructor(selectFunction: (x: T, contextData?: any[]) => any, descending: boolean = false, contextData?: any[]) {
    this.selectFunction = selectFunction;
    this.selectFunctionString = selectFunction.toString();
    this.descending = descending;

    if (contextData) {
      this.contextData = contextData.map(v => {
        return JSON.parse(JSON.stringify(v));
      });
    }
  }

  public execute(values: T[]) {
    return ArrayHelper.orderBy(values, x => this.selectFunction(x, this.contextData), this.descending);
  }

  public hash() {
    return `${this.prefilterType},${this.selectFunctionString},${this.descending},${JSON.stringify(this.contextData)}`;
  }
}
