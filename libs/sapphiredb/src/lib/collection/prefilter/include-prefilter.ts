import {IPrefilter} from './iprefilter';

export class IncludePrefilter<T> implements IPrefilter<T, T[]> {
  prefilterType = 'IncludePrefilter';
  include: string;

  constructor(include: string) {
    this.include = include;
  }

  public execute(values: T[]): T[] {
    return values;
  }

  public hash() {
    return `${this.prefilterType},${this.include}`;
  }
}
