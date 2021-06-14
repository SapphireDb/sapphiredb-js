import {WherePrefilter} from './prefilter/where-prefilter';
import {SkipPrefilter} from './prefilter/skip-prefilter';
import {TakePrefilter} from './prefilter/take-prefilter';
import {OrderByPrefilter} from './prefilter/order-by-prefilter';
import {CollectionBase} from './collection-base';
import {CollectionManager} from './collection-manager';
import {ReducedCollection} from './reduced-collection';
import {SelectPrefilter} from './prefilter/select-prefilter';
import {CountPrefilter} from './prefilter/count-prefilter';
import {OrderedCollection} from './ordered-collection';
import {ConnectionManager} from '../connection/connection-manager';
import {FirstPrefilter} from './prefilter/first-prefilter';
import {ConditionType} from '../helper/condition-types';
import {IncludePrefilter} from './prefilter/include-prefilter';
import {ClassType, SortDirection} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';
import {OfflineManager} from '../modules/offline/offline-manager';

export class DefaultCollection<T> extends CollectionBase<T, T[]> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManager,
              collectionManagerService: CollectionManager,
              classType: ClassType<T>,
              classTransformer: SapphireClassTransformer,
              offlineManager: OfflineManager,
              enableLocalChangePreview: boolean) {
    super(collectionName, connectionManagerService, collectionManagerService, classType, classTransformer, offlineManager,
      enableLocalChangePreview);
  }

  /**
   * Skip a number of entries
   * @param number Number of entries to skip
   */
  public skip(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new SkipPrefilter(number));
  }

  /**
   * Take a number of entries
   * @param number Number of entries to take
   */
  public take(number: number): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new TakePrefilter(number));
  }

  /**
   * Filter the data to query
   * @param conditions The array of conditions for the filter operation
   */
  public where(conditions: ConditionType<T>): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new WherePrefilter(conditions));
  }

  /**
   * Apply ordering to the collection
   * @param property The name of the property to order by
   * @param direction The direction of ordering
   */
  public orderBy(property: keyof T, direction: SortDirection = SortDirection.ascending): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new OrderByPrefilter(property, direction));
  }

  /**
   * Only query specific data defined by selector
   * @param properties The properties of the model to select
   */
  public select<Z>(...properties: (keyof T)[]): ReducedCollection<T, Z[]> {
    return this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new SelectPrefilter(properties));
  }

  /**
   * Specify the navigation properties to explicitly load from database
   * @param include The navigation property string (use EF Core Syntax)
   */
  public include(include: string): DefaultCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new IncludePrefilter(include));
  }

  /**
   * Get the number of elements in the collection
   */
  public count(): ReducedCollection<T, number> {
    return this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new CountPrefilter());
  }

  /**
   * Get the first element of the collection
   */
  public first(): ReducedCollection<T, T[]> {
    return this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new FirstPrefilter());
  }
}
