import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';
import {CollectionManager} from './collection-manager';
import {DefaultCollection} from './default-collection';
import {ConnectionManager} from '../connection/connection-manager';
import {ClassType, SortDirection} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';
import {OfflineManager} from '../modules/offline/offline-manager';

export class OrderedCollection<T> extends DefaultCollection<T> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManager,
              collectionManagerService: CollectionManager,
              classType?: ClassType<T>,
              classTransformer?: SapphireClassTransformer,
              offlineManager?: OfflineManager,
              enableLocalChangePreview?: boolean) {
    super(collectionName, connectionManagerService, collectionManagerService, classType, classTransformer, offlineManager,
      enableLocalChangePreview);
  }

  /**
   * Apply additional ordering to the collection without effecting previous order
   * @param property The name of the property to order by
   * @param direction The direction of ordering
   */
  public thenOrderBy(property: keyof T, direction: SortDirection = SortDirection.ascending): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.prefilters, new ThenOrderByPrefilter(property, direction));
  }
}
