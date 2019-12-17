import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';
import {CollectionManagerService} from './services/collection-manager.service';
import {DefaultCollection} from './default-collection';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';

export class OrderedCollection<T> extends DefaultCollection<T> {
  constructor(collectionName: string,
              contextName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, contextName, connectionManagerService, collectionInformation, collectionManagerService);
  }

  /**
   * Apply additional ordering to the collection without effecting previous order
   * @param property The name of the property to order by
   * @param descending Order the selection in descending order
   */
  public thenOrderBy(property: keyof T, descending: boolean = false): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters,
      new ThenOrderByPrefilter(property, descending));
  }
}
