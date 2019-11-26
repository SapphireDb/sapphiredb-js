import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {CollectionValuesService} from './services/collection-values.service';
import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';
import {CollectionManagerService} from './services/collection-manager.service';
import {DefaultCollection} from './default-collection';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';

export class OrderedCollection<T> extends DefaultCollection<T> {
  constructor(collectionName: string,
              contextName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionValuesService: CollectionValuesService,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, contextName, connectionManagerService, collectionInformation, collectionValuesService, collectionManagerService);
  }

  /**
   * Apply additional ordering to the collection without effecting previous order
   * @param selector A selector to select value to order by
   * @param descending Order the selection in descending order
   * @param contextData Optional data that are used in the selector
   */
  public thenOrderBy<Y extends any[]>(selector: (value: T, contextData?: Y) => any,
                                      descending: boolean = false, ...contextData: Y): OrderedCollection<T> {
    return <any>this.collectionManagerService.getCollection(this.collectionName, this.contextName, this.prefilters,
      new ThenOrderByPrefilter(selector, descending, contextData));
  }
}
