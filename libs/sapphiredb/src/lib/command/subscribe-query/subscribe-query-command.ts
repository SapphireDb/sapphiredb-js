import {QueryQueryCommand} from '../query-query/query-query-command';

export class SubscribeQueryCommand extends QueryQueryCommand {

  constructor(queryName: string, parameters: any[]) {
    super(queryName, parameters);
    this.commandType = 'SubscribeQueryCommand';
  }
}
