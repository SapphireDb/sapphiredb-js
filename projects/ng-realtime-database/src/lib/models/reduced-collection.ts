import {CollectionBase} from './collection-base';
import {Observable} from 'rxjs';
import {InfoResponse} from './response/info-response';
import {CollectionValuesService} from '../collection-values.service';
import {CollectionManagerService} from '../collection-manager.service';
import {ConnectionManagerService} from '../connection/connection-manager.service';

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
