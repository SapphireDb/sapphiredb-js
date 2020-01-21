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

export class CollectionManager {
  constructor(private connectionManager: ConnectionManager,
              private collectionInformation: CollectionInformationManager,
              private classTransformer: SapphireClassTransformer) {}

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
        this);
    } else if (newPrefilter instanceof OrderByPrefilter || newPrefilter instanceof ThenOrderByPrefilter) {
      newCollection = new OrderedCollection<any>(
        collectionName,
        this.connectionManager,
        this.collectionInformation.getCollectionInformation(collectionName,),
        this,
        classType,
        this.classTransformer);
    } else {
      newCollection = new DefaultCollection<any>(
        collectionName,
        this.connectionManager,
        this.collectionInformation.getCollectionInformation(collectionName),
        this,
        classType,
        this.classTransformer);
    }

    newCollection.prefilters = newPrefilters;

    return newCollection;
  }
}
