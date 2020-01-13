import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';
import {CollectionManagerService} from './services/collection-manager.service';
import {DefaultCollection} from './default-collection';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';
import {ClassType, SortDirection} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';

export class OrderedCollection<T> extends DefaultCollection<T> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManagerService,
              classType: ClassType<T>,
              classTransformer: SapphireClassTransformer) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, classType, classTransformer);
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
