import {concat, Observable, OperatorFunction} from 'rxjs';

export function startWithObservable<T, D>(startWith: Observable<D>): OperatorFunction<T, T | D> {
  return ((source: Observable<T>) => concat(startWith, source));
}
