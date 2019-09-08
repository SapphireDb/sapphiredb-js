import {Injectable} from '@angular/core';
import {CollectionValue} from './models/collection-value';
import {IPrefilter} from './models/prefilter/iprefilter';
import {SubscribeCommand} from './models/command/subscribe-command';
import {QueryResponse} from './models/response/query-response';
import {ChangeResponse} from './models/response/change-response';
import {UnloadResponse} from './models/response/unload-response';
import {LoadResponse} from './models/response/load-response';
import {CollectionHelper} from './helper/collection-helper';
import {Observable} from 'rxjs';
import {InfoResponse} from './models/response/info-response';
import {ConnectionManagerService} from './connection/connection-manager.service';

@Injectable()
export class CollectionValuesService {

  private collectionValues: { [collectionName: string]: CollectionValue<any>[] } = {};

  constructor(private connectionManagerService: ConnectionManagerService) { }

  public getCollectionValue<T>(collectionName: string, contextName: string, prefilters: IPrefilter<any, any>[],
                               collectionInformation: Observable<InfoResponse>): CollectionValue<T> {
    if (!this.collectionValues[collectionName]) {
      this.collectionValues[collectionName] = [];
    }

    const index = this.collectionValues[collectionName].findIndex(c => c.samePrefilters(prefilters));

    let collectionValue: CollectionValue<T>;
    if (index !== -1) {
      collectionValue = this.collectionValues[collectionName][index];
      collectionValue.subscriberCount++;
    } else {
      collectionValue = this.createWebsocketValuesSubscription(collectionName, contextName, collectionInformation, prefilters);
    }

    return collectionValue;
  }

  public removeCollectionValue(collectionName: string, collectionValue: CollectionValue<any>) {
    const indexToRemove = this.collectionValues[collectionName].findIndex(c => c.referenceId === collectionValue.referenceId);
    this.collectionValues[collectionName].splice(indexToRemove, 1);
  }

  private createWebsocketValuesSubscription<T>(collectionName: string, contextName: string, collectionInformation: Observable<InfoResponse>,
                                               prefilters: IPrefilter<any, any>[]): CollectionValue<T> {
    const subscribeCommand = new SubscribeCommand(collectionName, contextName, prefilters);
    const collectionValue = new CollectionValue<T>(subscribeCommand.referenceId, prefilters);

    const wsSubscription = this.connectionManagerService.sendCommand(subscribeCommand, true)
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
