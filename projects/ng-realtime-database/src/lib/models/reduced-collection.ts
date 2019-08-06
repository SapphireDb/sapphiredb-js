import {CollectionBase} from './collection-base';
import {WebsocketService} from '../websocket.service';
import {Observable} from 'rxjs';
import {InfoResponse} from './response/info-response';
import {CollectionValuesService} from '../collection-values.service';
import {CollectionManagerService} from '../collection-manager.service';

export class ReducedCollection<T, Y> extends CollectionBase<T, Y> {
  constructor(collectionName: string,
              contextName: string,
              websocket: WebsocketService,
              collectionInformation: Observable<InfoResponse>,
              collectionValuesService: CollectionValuesService,
              collectionManagerService: CollectionManagerService) {
    super(collectionName, contextName, websocket, collectionInformation, collectionValuesService, collectionManagerService);
  }
}
