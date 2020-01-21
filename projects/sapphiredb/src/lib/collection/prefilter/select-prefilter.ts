import {IPrefilter} from './iprefilter';

export class SelectPrefilter<T> implements IPrefilter<T, any[]> {
  prefilterType = 'SelectPrefilter';
  properties: (keyof T)[];

  constructor(properties: (keyof T)[]) {
    this.properties = properties;
  }

  public execute(values: T[]) {
    return values;
  }

  public hash() {
    return `${this.prefilterType},${JSON.stringify(this.properties)}`;
  }
}
