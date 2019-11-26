export interface IPrefilter<T, Y> {
  prefilterType: string;
  execute(values: T[]): Y;
  hash(): string;
}
