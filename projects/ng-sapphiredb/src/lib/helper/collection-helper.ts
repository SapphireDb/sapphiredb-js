import {UnloadResponse} from '../command/subscribe/unload-response';
import {InfoResponse} from '../command/info/info-response';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {LoadResponse} from '../command/subscribe/load-response';
import {ChangeResponse, ChangeState} from '../command/subscribe/change-response';
import {FilterFunctions} from './filter-functions';
import {SelectPrefilter} from '../collection/prefilter/select-prefilter';
import {CountPrefilter} from '../collection/prefilter/count-prefilter';
import {IPrefilter} from '../collection/prefilter/iprefilter';
import {concatMap, map, switchMap, take} from 'rxjs/operators';

// @dynamic
export class CollectionHelper {
  static afterQueryPrefilters = [SelectPrefilter, CountPrefilter];

  static unloadItem<T>(collectionData$: ReplaySubject<T[]>, info$: Observable<InfoResponse>, unloadResponse: UnloadResponse) {
    info$.pipe(
      switchMap((info) => collectionData$.pipe(map(values => [info, values]))),
      take(1)
    ).subscribe(([info, values]: [InfoResponse, T[]]) => {
      const primaryKeys = info.primaryKeys;

      const index = values.findIndex(c => {
        let isCorrectElement = true;

        for (let i = 0; i < primaryKeys.length; i++) {
          if (c[primaryKeys[i]] !== unloadResponse.primaryValues[i]) {
            isCorrectElement = false;
            break;
          }
        }

        return isCorrectElement;
      });

      if (index !== -1) {
        values.splice(index, 1);
        collectionData$.next(values);
      }
    });
  }

  static loadItem<T>(collectionData$: ReplaySubject<T[]>, loadResponse: LoadResponse) {
    collectionData$.pipe(take(1)).subscribe((values: T[]) => {
      collectionData$.next(values.concat([loadResponse.newObject]));
    });
  }

  static updateCollection<T>(collectionData$: ReplaySubject<T[]>, info$: Observable<InfoResponse>, changeResponse: ChangeResponse) {
    info$.pipe(
      switchMap((info) => collectionData$.pipe(map(values => [info, values]))),
      take(1)
    ).subscribe(([info, values]: [InfoResponse, T[]]) => {
      if (changeResponse.state === ChangeState.Added) {
        collectionData$.next(values.concat([changeResponse.value]));
      } else if (changeResponse.state === ChangeState.Modified) {
        const index = values.findIndex(
          FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, changeResponse.value));

        if (index !== -1) {
          values[index] = changeResponse.value;
          collectionData$.next(values);
        }
      } else if (changeResponse.state === ChangeState.Deleted) {
        const index = values.findIndex(
          FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, changeResponse.value));

        if (index !== -1) {
          values.splice(index, 1);
          collectionData$.next(values);
        }
      }
    });
  }
}
