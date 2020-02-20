import {CollectionInformationManager} from './collection-information-manager';
import {CollectionBase} from './collection-base';
import {DefaultCollection} from './default-collection';
import {IPrefilter} from './prefilter/iprefilter';
import {ReducedCollection} from './reduced-collection';
import {CollectionHelper} from '../helper/collection-helper';
import {OrderByPrefilter} from './prefilter/order-by-prefilter';
import {OrderedCollection} from './ordered-collection';
import {ThenOrderByPrefilter} from './prefilter/then-order-by-prefilter';
import {ConnectionManager} from '../connection/connection-manager';
import {ClassType} from '../models/types';
import {SapphireClassTransformer} from '../helper/sapphire-class-transformer';
import {OfflineManager} from '../modules/offline/offline-manager';

export class CollectionManager {
  constructor(private connectionManager: ConnectionManager,
              private collectionInformation: CollectionInformationManager,
              private classTransformer: SapphireClassTransformer,
              private offlineManager: OfflineManager) {}

  public getCollection<T>(collectionName: string, prefilters: IPrefilter<any, any>[],
                          newPrefilter?: IPrefilter<any, any>, classType?: ClassType<T>): CollectionBase<T, any> {
    const newPrefilters = prefilters.slice(0);

    if (newPrefilter) {
      newPrefilters.push(newPrefilter);
    }

    let newCollection;
    if (CollectionHelper.afterQueryPrefilters.findIndex(v => newPrefilter instanceof v) !== -1) {
      newCollection = new ReducedCollection<any, any>(
        collectionName,
        this.connectionManager,
        this.collectionInformation.getCollectionInformation(collectionName),
        this,
        this.offlineManager);
    } else if (newPrefilter instanceof OrderByPrefilter || newPrefilter instanceof ThenOrderByPrefilter) {
      newCollection = new OrderedCollection<any>(
        collectionName,
        this.connectionManager,
        this.collectionInformation.getCollectionInformation(collectionName,),
        this,
        classType,
        this.classTransformer,
        this.offlineManager);
    } else {
      newCollection = new DefaultCollection<any>(
        collectionName,
        this.connectionManager,
        this.collectionInformation.getCollectionInformation(collectionName),
        this,
        classType,
        this.classTransformer,
        this.offlineManager);
    }

    newCollection.prefilters = newPrefilters;

    return newCollection;
  }
}
