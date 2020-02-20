import {CollectionBase} from './collection-base';
import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {CollectionManager} from './collection-manager';
import {ConnectionManager} from '../connection/connection-manager';
import {OfflineManager} from '../modules/offline/offline-manager';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManager,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManager,
              offlineManager: OfflineManager) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, null, null, offlineManager);
  }
}
