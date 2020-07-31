import {CommandBase} from '../command-base';

export class QueryQueryCommand extends CommandBase {
  queryName: string;
  parameters: any[];

  constructor(queryName: string, parameters: any[]) {
    super('QueryQueryCommand');
    this.queryName = queryName;
    this.parameters = parameters;
  }
}
