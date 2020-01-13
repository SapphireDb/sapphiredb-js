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
import {IncludePrefilter} from './prefilter/include-prefilter';
import {ClassType, SortDirection} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';

export class DefaultCollection<T> extends CollectionBase<T, T[]> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManagerService,
              classType: ClassType<T>,
              classTransformer: SapphireClassTransformer) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, classType, classTransformer);
  }

  /**
   * Skip a number of entries
   * @param number Number of entries to skip
   */
  public skip(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      `${this.contextName}.${this.collectionName}`, this.prefilters, new SkipPrefilter(number));
  }

  /**
   * Take a number of entries
   * @param number Number of entries to take
   */
  public take(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      `${this.contextName}.${this.collectionName}`, this.prefilters, new TakePrefilter(number));
  }

  /**
   * Filter the data to query
   * @param conditions The array of conditions for the filter operation
   */
  public where(conditions: ConditionType<T>): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(
      `${this.contextName}.${this.collectionName}`, this.prefilters, new WherePrefilter(conditions));
  }

  /**
   * Apply ordering to the collection
   * @param property The name of the property to order by
   * @param direction The direction of ordering
   */
  public orderBy(property: keyof T, direction: SortDirection = SortDirection.ascending): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters,
      new OrderByPrefilter(property, direction));
  }

  /**
   * Only query specific data defined by selector
   * @param properties The properties of the model to select
   */
  public select<Z>(...properties: (keyof T)[]): ReducedCollection<T, Z[]> {
    return this.collectionManagerService.getCollection(
      `${this.contextName}.${this.collectionName}`, this.prefilters, new SelectPrefilter(properties));
  }

  /**
   * Specify the navigation properties to explicitly load from database
   * @param include The navigation property string (use EF Core Syntax)
   */
  public include(include: string): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters, new IncludePrefilter(include));
  }

  /**
   * Get the number of elements in the collection
   */
  public count(): ReducedCollection<T, number> {
    return this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters, new CountPrefilter());
  }

  /**
   * Get the first element of the collection. Returns null if nothing was found.
   */
  public first(): ReducedCollection<T, T> {
    return this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters, new FirstPrefilter());
  }

  /**
   * Get the last element of the collection. Returns null if nothing was found.
   */
  public last(): ReducedCollection<T, T> {
    return this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters, new LastPrefilter());
  }
}
