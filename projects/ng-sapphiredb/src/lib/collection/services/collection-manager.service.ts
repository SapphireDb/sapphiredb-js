import {Injectable, Optional} from '@angular/core';
import {CollectionInformationService} from './collection-information.service';
import {CollectionBase} from '../collection-base';
import {DefaultCollection} from '../default-collection';
import {IPrefilter} from '../prefilter/iprefilter';
import {ReducedCollection} from '../reduced-collection';
import {CollectionHelper} from '../../helper/collection-helper';
import {OrderByPrefilter} from '../prefilter/order-by-prefilter';
import {OrderedCollection} from '../ordered-collection';
import {ThenOrderByPrefilter} from '../prefilter/then-order-by-prefilter';
import {ConnectionManagerService} from '../../connection/services/connection-manager.service';
import {ClassType} from '../../models/types';
import {SapphireClassTransformer} from '../../helper/sapphire-class-transformer';

@Injectable()
export class CollectionManagerService {
  constructor(private connectionManagerService: ConnectionManagerService,
              private collectionInformation: CollectionInformationService,
              @Optional() private classTransformer: SapphireClassTransformer) {}

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
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName),
        this);
    } else if (newPrefilter instanceof OrderByPrefilter || newPrefilter instanceof ThenOrderByPrefilter) {
      newCollection = new OrderedCollection<any>(
        collectionName,
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName,),
        this,
        classType,
        this.classTransformer);
    } else {
      newCollection = new DefaultCollection<any>(
        collectionName,
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName),
        this,
        classType,
        this.classTransformer);
    }

    newCollection.prefilters = newPrefilters;

    return newCollection;
  }
}
