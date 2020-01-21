import {CollectionBase} from './collection-base';
import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {CollectionManager} from './collection-manager';
import {ConnectionManager} from '../connection/connection-manager';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManager,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManager) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, null, null);
  }
}
