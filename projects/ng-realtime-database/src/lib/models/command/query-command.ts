import {CollectionCommandBase} from './collection-command-base';
import {IPrefilter} from '../prefilter/iprefilter';

export class QueryCommand extends CollectionCommandBase {
  prefilters: IPrefilter<any, any>[];

  constructor(collectionName: string, contextName: string, prefilters: IPrefilter<any, any>[]) {
    super('QueryCommand', collectionName, contextName);
    this.prefilters = prefilters;
  }
}
