import { Injectable } from '@angular/core';
import {CollectionValue} from './models/collection-value';
import {IPrefilter} from './models/prefilter/iprefilter';
import {SubscribeCommand} from './models/command/subscribe-command';
import {QueryResponse} from './models/response/query-response';
import {ChangeResponse} from './models/response/change-response';
import {UnloadResponse} from './models/response/unload-response';
import {LoadResponse} from './models/response/load-response';
import {CollectionHelper} from './helper/collection-helper';
import {WebsocketService} from './websocket.service';
import {Observable} from 'rxjs';
import {InfoResponse} from './models/response/info-response';

@Injectable()
export class CollectionValuesService {

  private collectionValues: { [collectionName: string]: CollectionValue<any>[] } = {};

  constructor(private websocket: WebsocketService) { }

  public getCollectionValue<T>(collectionName: string, prefilters: IPrefilter<any, any>[],
                               collectionInformation: Observable<InfoResponse>): CollectionValue<T> {
    if (!this.collectionValues[collectionName]) {
      this.collectionValues[collectionName] = [];
    }

    const index = this.collectionValues[collectionName].findIndex(c => c.samePrefilters(prefilters));

    let collectionValue: CollectionValue<T>;
    if (index !== -1) {
      console.log('test123');
      collectionValue = this.collectionValues[collectionName][index];
      collectionValue.subscriberCount++;
    } else {
      collectionValue = this.createWebsocketValuesSubscription(collectionName, collectionInformation, prefilters);
    }

    return collectionValue;
  }

  public removeCollectionValue(collectionName: string, collectionValue: CollectionValue<any>) {
    const indexToRemove = this.collectionValues[collectionName].findIndex(c => c.referenceId === collectionValue.referenceId);
    this.collectionValues[collectionName].splice(indexToRemove, 1);
  }

  private createWebsocketValuesSubscription<T>(collectionName: string, collectionInformation: Observable<InfoResponse>,
                                               prefilters: IPrefilter<any, any>[]): CollectionValue<T> {
    const subscribeCommand = new SubscribeCommand(collectionName, prefilters);
    const collectionValue = new CollectionValue<T>(subscribeCommand.referenceId, prefilters);

    const wsSubscription = this.websocket.sendCommand(subscribeCommand, true)
      .subscribe((response: (QueryResponse | ChangeResponse | UnloadResponse | LoadResponse)) => {
        if (response.responseType === 'QueryResponse') {
          collectionValue.subject.next((<QueryResponse>response).result);
        } else if (response.responseType === 'ChangeResponse') {
          CollectionHelper.updateCollection<T>(collectionValue.subject, collectionInformation, <ChangeResponse>response);
        } else if (response.responseType === 'UnloadResponse') {
          CollectionHelper.unloadItem<T>(collectionValue.subject, collectionInformation, <UnloadResponse>response);
        } else if (response.responseType === 'LoadResponse') {
          CollectionHelper.loadItem<T>(collectionValue.subject, <LoadResponse>response);
        }
      });

    collectionValue.setSubscription(wsSubscription);
    this.collectionValues[collectionName].push(collectionValue);

    return collectionValue;
  }
}
