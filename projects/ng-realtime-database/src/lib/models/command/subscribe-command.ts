import {IPrefilter} from '../prefilter/iprefilter';
import {QueryCommand} from './query-command';

export class SubscribeCommand extends QueryCommand {
  constructor(collectionName: string, contextName: string, prefilters: IPrefilter<any, any>[]) {
    super(collectionName, contextName, prefilters);
    this.commandType = 'SubscribeCommand';
  }
}
