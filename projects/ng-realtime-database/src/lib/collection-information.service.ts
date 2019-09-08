import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {InfoResponse} from './models/response/info-response';
import {InfoCommand} from './models/command/info-command';
import {filter, take} from 'rxjs/operators';
import {ConnectionManagerService} from './connection/connection-manager.service';

@Injectable()
export class CollectionInformationService {
  private collectionInformation: { [collectionName: string]: Observable<InfoResponse> } = {};

  constructor(private connectionManagerService: ConnectionManagerService) { }

  public getCollectionInformation(collectionName: string, contextName: string) {
    if (!this.collectionInformation[collectionName]) {
      const subject$ = new BehaviorSubject<InfoResponse>(null);
      this.collectionInformation[collectionName] = subject$;
      this.connectionManagerService.sendCommand(new InfoCommand(collectionName, contextName)).subscribe((info: InfoResponse) => {
        subject$.next(info);
      });
    }

    return this.collectionInformation[collectionName].pipe(
      filter(v => !!v),
      take(1)
    );
  }
}
