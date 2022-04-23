import {Observable, of} from 'rxjs';

export abstract class SapphireStorage {
  abstract get(key: string): Observable<string | null>;
  abstract set(key: string, value: string): void;
}

export class SapphireNoopStorage extends SapphireStorage {
  get(key: string): Observable<string | null> {
    return of(null);
  }

  set(key: string, value: string): void {
    // does nothing
  }
}

export class SapphireLocalStorage extends SapphireStorage {
  get(key: string): Observable<string | null> {
    return of(localStorage.getItem(key));
  }

  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}
