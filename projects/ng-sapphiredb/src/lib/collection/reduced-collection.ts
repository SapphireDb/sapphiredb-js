import {CollectionBase} from './collection-base';
import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {CollectionManagerService} from './services/collection-manager.service';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, connectionManagerService, collectionInformation, collectionManagerService, null, null);
  }
}
