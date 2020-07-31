import {QueryQueryCommand} from '../query-query/query-query-command';

export class SubscribeQueryCommand extends QueryQueryCommand {
  queryName: string;
  parameters: any[];

  constructor(queryName: string, parameters: any[]) {
    super(queryName, parameters);
    this.commandType = 'SubscribeQueryCommand';
  }
}
