import {CollectionBase} from './collection-base';
import {ConnectionManager} from '../connection/connection-manager';
import {CollectionManager} from './collection-manager';
import {ClassType} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';
import {OfflineManager} from '../modules/offline/offline-manager';

export class QueryCollection<TModel, TReturnType = TModel[]> extends CollectionBase<TModel, TReturnType> {
  constructor(queryName: string,
              parameters: any[],
              connectionManagerService: ConnectionManager,
              collectionManagerService: CollectionManager,
              classType: ClassType<TModel>,
              classTransformer: SapphireClassTransformer,
              offlineManager: OfflineManager) {
    super(queryName, connectionManagerService, collectionManagerService, classType, classTransformer, offlineManager, true);
  }
}
