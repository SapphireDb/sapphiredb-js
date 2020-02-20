import {Observable} from 'rxjs';

export abstract class SapphireStorage {
  abstract get(key: string): Observable<string>;
  abstract set(key: string, value: string): void;
}
