import {IPrefilter} from '../../collection/prefilter/iprefilter';
import {QueryCommand} from '../query/query-command';

export class SubscribeCommand extends QueryCommand {
  constructor(collectionName: string, prefilters: IPrefilter<any, any>[]) {
    super(collectionName, prefilters);
    this.commandType = 'SubscribeCommand';
  }
}
