import {CollectionBase} from './collection-base';
import {CollectionManager} from './collection-manager';
import {ConnectionManager} from '../connection/connection-manager';
import {OfflineManager} from '../modules/offline/offline-manager';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManager,
              collectionManagerService: CollectionManager,
              offlineManager: OfflineManager) {
    super(collectionName, connectionManagerService, collectionManagerService, null, null, offlineManager);
  }
}
