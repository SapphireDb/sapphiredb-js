import {AuthCollectionInfo} from './auth-collection-info';
import {WebsocketService} from '../websocket.service';
import {Observable, pipe} from 'rxjs';
import {InfoResponse} from './response/info-response';
import {CollectionValuesService} from '../collection-values.service';
import {IPrefilter} from './prefilter/iprefilter';
import {QueryCommand} from './command/query-command';
import {QueryResponse} from './response/query-response';
import {finalize, map} from 'rxjs/operators';
import {CollectionValue} from './collection-value';
import {UnsubscribeCommand} from './command/unsubscribe-command';
import {WherePrefilter} from './prefilter/where-prefilter';
import {SkipPrefilter} from './prefilter/skip-prefilter';
import {TakePrefilter} from './prefilter/take-prefilter';
import {OrderByPrefilter} from './prefilter/order-by-prefilter';
import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';

export class CollectionBase<T> {
  /**
   * Information about Authentication and Authorization of the collection
   */
  public authInfo: AuthCollectionInfo;

  protected prefilters: IPrefilter<any>[] = [];

  constructor(public collectionName: string,
              protected websocket: WebsocketService,
              protected collectionInformation: Observable<InfoResponse>,
              private collectionValuesService: CollectionValuesService) {
    this.authInfo = new AuthCollectionInfo(this.collectionInformation);
  }

  /**
   * Get a snapshot of the values of the collection
   * @param prefilters Additional prefilters to query only specific data
   */
  public snapshot(/*...prefilters: IPrefilter<T>[]*/): Observable<T[]> {
    const queryCommand = new QueryCommand(this.collectionName, this.prefilters);

    return this.websocket.sendCommand(queryCommand).pipe(
      map((response: QueryResponse) => {
        let array = response.collection;

        for (const prefilter of this.prefilters) {
          array = prefilter.execute(array);
        }

        return array;
      })
    );
  }

  /**
   * Get the values of the collection and also get updates if the collection has changed
   * @param prefilters Additional prefilters to query only specific data
   */
  public values(/*...prefilters: IPrefilter<T>[]*/): Observable<T[]> {
    const collectionValue = this.collectionValuesService
      .getCollectionValue(this.collectionName, this.prefilters, this.collectionInformation);
    return this.createCollectionObservable$(collectionValue, this.prefilters);
  }

  private createCollectionObservable$(collectionValue: CollectionValue<T>, prefilters: IPrefilter<T>[]): Observable<T[]> {
    return collectionValue.subject.pipe(finalize(() => {
      collectionValue.subscriberCount--;

      if (collectionValue.subscriberCount === 0) {
        this.websocket.sendCommand(new UnsubscribeCommand(this.collectionName, collectionValue.referenceId), false, true);
        collectionValue.socketSubscription.unsubscribe();
        this.collectionValuesService.removeCollectionValue(this.collectionName, collectionValue);
      }
    }), pipe(map((array: T[]) => {
      for (const prefilter of prefilters) {
        array = prefilter.execute(array);
      }

      return array;
    })));
  }

  /**
   * Filter the data to query
   * @param filter A function that returns true if the data should get queried
   * @param contextData Optional data that are used in the filter function
   */
  public where<Y extends any[]>(filter: (value: T, contextData?: Y) => boolean, ...contextData: Y): CollectionBase<T> {
    const newCollection =
      new CollectionBase<T>(this.collectionName, this.websocket, this.collectionInformation, this.collectionValuesService);
    newCollection.prefilters = this.prefilters.slice(0);
    newCollection.prefilters.push(new WherePrefilter(filter, contextData));

    return newCollection;
  }

  /**
   * Skip a number of entries
   * @param number Number of entries to skip
   */
  public skip(number: number): CollectionBase<T> {
    const newCollection =
      new CollectionBase<T>(this.collectionName, this.websocket, this.collectionInformation, this.collectionValuesService);
    newCollection.prefilters = this.prefilters.slice(0);
    newCollection.prefilters.push(new SkipPrefilter(number));

    return newCollection;
  }

  /**
   * Take a number of entries
   * @param number Number of entries to take
   */
  public take(number: number): CollectionBase<T> {
    const newCollection =
      new CollectionBase<T>(this.collectionName, this.websocket, this.collectionInformation, this.collectionValuesService);
    newCollection.prefilters = this.prefilters.slice(0);
    newCollection.prefilters.push(new TakePrefilter(number));

    return newCollection;
  }

  /**
   * Apply ordering to the collection
   * @param selector A selector to select value to order by
   * @param descending Order the selection in descending order
   * @param contextData Optional data that are used in the selector
   */
  public orderBy<Y extends any[]>(selector: (value: T, contextData?: Y) => any,
                                  descending: boolean = false, ...contextData: Y): CollectionBase<T> {
    const newCollection =
      new CollectionBase<T>(this.collectionName, this.websocket, this.collectionInformation, this.collectionValuesService);
    newCollection.prefilters = this.prefilters.slice(0);
    newCollection.prefilters.push(new OrderByPrefilter(selector, descending, contextData));

    return newCollection;
  }

  /**
   * Apply additional ordering to the collection without effecting previous order
   * @param selector A selector to select value to order by
   * @param descending Order the selection in descending order
   * @param contextData Optional data that are used in the selector
   */
  public thenOrderBy<Y extends any[]>(selector: (value: T, contextData?: Y) => any,
                                      descending: boolean = false, ...contextData: Y): CollectionBase<T> {
    const newCollection =
      new CollectionBase<T>(this.collectionName, this.websocket, this.collectionInformation, this.collectionValuesService);
    newCollection.prefilters = this.prefilters.slice(0);
    newCollection.prefilters.push(new ThenOrderByPrefilter(selector, descending, contextData));

    return newCollection;
  }
}
