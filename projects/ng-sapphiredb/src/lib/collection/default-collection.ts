import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {WherePrefilter} from './prefilter/where-prefilter';
import {SkipPrefilter} from './prefilter/skip-prefilter';
import {TakePrefilter} from './prefilter/take-prefilter';
import {OrderByPrefilter} from './prefilter/order-by-prefilter';
import {CollectionBase} from './collection-base';
import {CollectionManagerService} from './services/collection-manager.service';
import {ReducedCollection} from './reduced-collection';
import {SelectPrefilter} from './prefilter/select-prefilter';
import {CountPrefilter} from './prefilter/count-prefilter';
import {OrderedCollection} from './ordered-collection';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';
import {FirstPrefilter} from './prefilter/first-prefilter';
import {LastPrefilter} from './prefilter/last-prefilter';
import {ConditionType} from '../helper/condition-types';

export class DefaultCollection<T> extends CollectionBase<T, T[]> {
  constructor(collectionName: string,
              contextName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, contextName, connectionManagerService, collectionInformation, collectionManagerService);
  }

  /**
   * Skip a number of entries
   * @param number Number of entries to skip
   */
  public skip(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      this.collectionName, this.contextName, this.prefilters, new SkipPrefilter(number));
  }

  /**
   * Take a number of entries
   * @param number Number of entries to take
   */
  public take(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      this.collectionName, this.contextName, this.prefilters, new TakePrefilter(number));
  }

  /**
   * Filter the data to query
   * @param conditions The array of conditions for the filter operation
   */
  public where(conditions: ConditionType<T>): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      this.collectionName, this.contextName, this.prefilters, new WherePrefilter(conditions));
  }

  /**
   * Apply ordering to the collection
   * @param property The name of the property to order by
   * @param descending Order the selection in descending order
   */
  public orderBy(property: keyof T, descending: boolean = false): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters,
      new OrderByPrefilter(property, descending));
  }

  /**
   * Only query specific data defined by selector
   * @param properties The properties of the model to select
   */
  public select<Z>(...properties: (keyof T)[]): ReducedCollection<T, Z[]> {
    return this.collectionManagerService.getCollection(
      this.collectionName, this.contextName, this.prefilters, new SelectPrefilter(properties));
  }

  /**
   * Get the number of elements in the collection
   */
  public count(): ReducedCollection<T, number> {
    return this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters, new CountPrefilter());
  }

  /**
   * Get the first element of the collection. Returns null if nothing was found.
   */
  public first(): ReducedCollection<T, T> {
    return this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters, new FirstPrefilter());
  }

  /**
   * Get the last element of the collection. Returns null if nothing was found.
   */
  public last(): ReducedCollection<T, T> {
    return this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters, new LastPrefilter());
  }
}
