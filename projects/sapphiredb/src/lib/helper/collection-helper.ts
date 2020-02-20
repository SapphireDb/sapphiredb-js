import {InfoResponse} from '../command/info/info-response';
import {Observable, ReplaySubject} from 'rxjs';
import {ChangeResponse, ChangeState} from '../command/subscribe/change-response';
import {FilterFunctions} from './filter-functions';
import {SelectPrefilter} from '../collection/prefilter/select-prefilter';
import {CountPrefilter} from '../collection/prefilter/count-prefilter';
import {IPrefilter} from '../collection/prefilter/iprefilter';
import {map, switchMap, take} from 'rxjs/operators';
import {FirstPrefilter} from '../collection/prefilter/first-prefilter';
import {LastPrefilter} from '../collection/prefilter/last-prefilter';

// @dynamic
export class CollectionHelper {
  static afterQueryPrefilters = [SelectPrefilter, CountPrefilter, FirstPrefilter, LastPrefilter];

  static getPrefiltersWithoutAfterQueryPrefilters(prefilters: IPrefilter<any, any>[]) {
    return prefilters.filter(
      p => CollectionHelper.afterQueryPrefilters.findIndex(f => p instanceof f) === -1);
  }

  static hasAfterQueryPrefilter(prefilters: IPrefilter<any, any>[]) {
    return prefilters.filter(
      p => CollectionHelper.afterQueryPrefilters.findIndex(f => p instanceof f) !== -1
    ).length !== 0;
  }

  static getPrefilterHash(prefilters: IPrefilter<any, any>[]) {
    return prefilters.reduce((prev, current) => prev += current.hash(), '');
  }

  static updateCollection<T>(info: InfoResponse, values: T[], changeResponse: ChangeResponse) {
    if (changeResponse.state === ChangeState.Modified) {
      const index = values.findIndex(
        FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, changeResponse.value));

      if (index !== -1) {
        values[index] = changeResponse.value;
      }
    } else if (changeResponse.state === ChangeState.Added) {
      values.push(changeResponse.value);
    } else if (changeResponse.state === ChangeState.Deleted) {
      const primaryKeys = info.primaryKeys;

      const index = values.findIndex(c => {
        let isCorrectElement = true;

        for (let i = 0; i < primaryKeys.length; i++) {
          if (c[primaryKeys[i]] !== changeResponse.value[primaryKeys[i]]) {
            isCorrectElement = false;
            break;
          }
        }

        return isCorrectElement;
      });

      if (index !== -1) {
        values.splice(index, 1);
      }
    }
  }
}
