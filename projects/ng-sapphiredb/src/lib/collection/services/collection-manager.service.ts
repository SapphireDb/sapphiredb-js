import {Injectable} from '@angular/core';
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

@Injectable()
export class CollectionManagerService {
  constructor(private connectionManagerService: ConnectionManagerService, private collectionInformation: CollectionInformationService) {}

  public getCollection<T>(collectionName: string, contextName: string, prefilters: IPrefilter<any, any>[],
                          newPrefilter?: IPrefilter<any, any>): CollectionBase<T, any> {
    const newPrefilters = prefilters.slice(0);

    if (newPrefilter) {
      newPrefilters.push(newPrefilter);
    }

    let newCollection;
    if (CollectionHelper.afterQueryPrefilters.findIndex(v => newPrefilter instanceof v) !== -1) {
      newCollection = new ReducedCollection<any, any>(
        collectionName,
        contextName,
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName, contextName),
        this);
    } else if (newPrefilter instanceof OrderByPrefilter || newPrefilter instanceof ThenOrderByPrefilter) {
      newCollection = new OrderedCollection<any>(
        collectionName,
        contextName,
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName, contextName),
        this);
    } else {
      newCollection = new DefaultCollection<any>(
        collectionName,
        contextName,
        this.connectionManagerService,
        this.collectionInformation.getCollectionInformation(collectionName, contextName),
        this);
    }

    newCollection.prefilters = newPrefilters;

    return newCollection;
  }
}
