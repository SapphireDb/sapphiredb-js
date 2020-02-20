import {concat, Observable, OperatorFunction} from 'rxjs';

// @dynamic
export class RxjsHelper {
  static startWithObservable<T, D>(startWith: Observable<D>): OperatorFunction<T, T | D> {
    return ((source: Observable<T>) => concat(startWith, source));
  }
}
