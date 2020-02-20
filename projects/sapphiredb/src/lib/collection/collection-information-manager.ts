import {Observable, of, ReplaySubject} from 'rxjs';
import {InfoResponse} from '../command/info/info-response';
import {InfoCommand} from '../command/info/info-command';
import {switchMap, take} from 'rxjs/operators';
import {ConnectionManager} from '../connection/connection-manager';
import {OfflineManager} from '../modules/offline/offline-manager';

export class CollectionInformationManager {
  private collectionInformation: { [name: string]: Observable<InfoResponse> } = {};

  constructor(private connectionManagerService: ConnectionManager, private offlineManager: OfflineManager) { }

  public getCollectionInformation(collectionNameRaw: string) {
    const collectionNameParts: string[] = collectionNameRaw.split('.');

    const collectionName = collectionNameParts.length === 1 ? collectionNameParts[0] : collectionNameParts[1];
    const contextName = collectionNameParts.length === 2 ? collectionNameParts[0] : 'default';

    if (!this.collectionInformation[`${contextName}:${collectionName}`]) {
      const subject$ = new ReplaySubject<InfoResponse>(1);
      this.collectionInformation[`${contextName}:${collectionName}`] = subject$;

      let collectionInformationFromStorage$: Observable<InfoResponse> = of(null);

      if (!!this.offlineManager) {
        collectionInformationFromStorage$ = this.offlineManager.getCollectionInformation(contextName, collectionName);
      }

      collectionInformationFromStorage$.pipe(
        switchMap((info) => {
          if (!!info) {
            return of(info);
          }

          return this.connectionManagerService.sendCommand(new InfoCommand(collectionName, contextName));
        }),
        take(1)
      ).subscribe((info: InfoResponse) => {
        this.offlineManager.setCollectionInformation(contextName, collectionName, info);
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
