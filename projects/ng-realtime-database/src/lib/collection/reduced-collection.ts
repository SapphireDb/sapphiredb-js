import {CollectionBase} from './collection-base';
import {Observable} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {CollectionValuesService} from './services/collection-values.service';
import {CollectionManagerService} from './services/collection-manager.service';
import {ConnectionManagerService} from '../connection/services/connection-manager.service';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              contextName: string,
              connectionManagerService: ConnectionManagerService,
              collectionInformation: Observable<InfoResponse>,
              collectionValuesService: CollectionValuesService,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, contextName, connectionManagerService, collectionInformation, collectionValuesService, collectionManagerService);
  }
}
