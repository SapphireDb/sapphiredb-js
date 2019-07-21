import {Injectable} from '@angular/core';
import {WebsocketService} from './websocket.service';
import {CollectionInformationService} from './collection-information.service';
import {CollectionValuesService} from './collection-values.service';
import {CollectionBase} from './models/collection-base';
import {DefaultCollection} from './models/default-collection';
import {IPrefilter} from './models/prefilter/iprefilter';
import {ArrayHelper} from './helper/array-helper';
import {SelectPrefilter} from './models/prefilter/select-prefilter';
import {ReducedCollection} from './models/reduced-collection';
import {CountPrefilter} from './models/prefilter/count-prefilter';
import {CollectionHelper} from './helper/collection-helper';
import {OrderByPrefilter} from './models/prefilter/order-by-prefilter';
import {OrderedCollection} from './models/ordered-collection';
import {ThenOrderByPrefilter} from './models/prefilter/then-order-by-prefilter';

@Injectable()
export class CollectionManagerService {

  private collections: CollectionBase<any, any>[] = [];

  constructor(private websocket: WebsocketService, private collectionInformation: CollectionInformationService,
              private collectionValuesService: CollectionValuesService) {}

  public getCollection<T>(collectionName: string, prefilters: IPrefilter<any, any>[],
                          newPrefilter?: IPrefilter<any, any>): CollectionBase<T, any> {
    const newPrefilters = prefilters.slice(0);

    if (newPrefilter) {
      newPrefilters.push(newPrefilter);
    }

    const foundCollections: DefaultCollection<T>[] = <any>this.collections
      .filter(c => this.collectionPredicate(collectionName, newPrefilters)(c));

    if (foundCollections.length > 0) {
      return foundCollections[0];
    } else {
      let newCollection;
      if (CollectionHelper.afterQueryPrefilters.findIndex(v => newPrefilter instanceof v) !== -1) {
        newCollection = new ReducedCollection<any, any>(
          collectionName,
          this.websocket,
          this.collectionInformation.getCollectionInformation(collectionName),
          this.collectionValuesService,
          this);
      } else if (newPrefilter instanceof OrderByPrefilter || newPrefilter instanceof ThenOrderByPrefilter) {
        newCollection = new OrderedCollection<any>(
          collectionName,
          this.websocket,
          this.collectionInformation.getCollectionInformation(collectionName),
          this.collectionValuesService,
          this);
      } else {
        newCollection = new DefaultCollection<any>(
          collectionName,
          this.websocket,
          this.collectionInformation.getCollectionInformation(collectionName),
          this.collectionValuesService,
          this);
      }

      newCollection.prefilters = newPrefilters;

      this.collections.push(newCollection);
      return newCollection;
    }
  }

  public removeCollection(collection: CollectionBase<any, any>) {
    const index = this.collections.findIndex(c => this.collectionPredicate(collection.collectionName, collection.prefilters)(c));
    if (index !== -1) {
      this.collections.splice(index, 1);
    }
  }

  private collectionPredicate = (collectionName: string, prefilters: IPrefilter<any, any>[]) => {
    const prefilterHash = ArrayHelper.createPrefilterHash(prefilters);
    return c => c.collectionName === collectionName && ArrayHelper.createPrefilterHash(c.prefilters) === prefilterHash;
  }
}
