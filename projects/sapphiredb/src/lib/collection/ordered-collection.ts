import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
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
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManager,
              classType: ClassType<T>,
              classTransformer: SapphireClassTransformer,
              offlineManager: OfflineManager) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, classType, classTransformer, offlineManager);
  }

  /**
   * Apply additional ordering to the collection without effecting previous order
   * @param property The name of the property to order by
   * @param direction The direction of ordering
   */
  public thenOrderBy(property: keyof T, direction: SortDirection = SortDirection.ascending): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(`${this.contextName}.${this.collectionName}`, this.prefilters,
      new ThenOrderByPrefilter(property, direction));
  }
}
