import {IPrefilter} from '../../collection/prefilter/iprefilter';
import {QueryCommand} from '../query/query-command';

export class SubscribeCommand extends QueryCommand {
  constructor(collectionName: string, contextName: string, prefilters: IPrefilter<any, any>[]) {
    super(collectionName, contextName, prefilters);
    this.commandType = 'SubscribeCommand';
  }
}
