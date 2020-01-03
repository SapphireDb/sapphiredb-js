import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {InfoResponse} from '../../command/info/info-response';
import {InfoCommand} from '../../command/info/info-command';
import {filter, take} from 'rxjs/operators';
import {ConnectionManagerService} from '../../connection/services/connection-manager.service';

@Injectable()
export class CollectionInformationService {
  private collectionInformation: { [name: string]: Observable<InfoResponse> } = {};

  constructor(private connectionManagerService: ConnectionManagerService) { }

  public getCollectionInformation(collectionNameRaw: string) {
    const collectionNameParts: string[] = collectionNameRaw.split('.');

    const collectionName = collectionNameParts.length === 1 ? collectionNameParts[0] : collectionNameParts[1];
    const contextName = collectionNameParts.length === 2 ? collectionNameParts[0] : 'default';

    if (!this.collectionInformation[`${contextName}:${collectionName}`]) {
      const subject$ = new ReplaySubject<InfoResponse>(1);
      this.collectionInformation[`${contextName}:${collectionName}`] = subject$;
      this.connectionManagerService.sendCommand(new InfoCommand(collectionName, contextName)).subscribe((info: InfoResponse) => {
        subject$.next(info);
      }, (error) => {
        subject$.error(error);
      });
    }

    return this.collectionInformation[`${contextName}:${collectionName}`].pipe(
      take(1)
    );
  }
}
