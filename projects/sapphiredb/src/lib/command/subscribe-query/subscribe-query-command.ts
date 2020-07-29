import {CommandBase} from '../command-base';

export class SubscribeQueryCommand extends CommandBase {
  queryName: string;
  parameters: any[];

  constructor(queryName: string, parameters: any[]) {
    super('SubscribeQueryCommand');
    this.queryName = queryName;
    this.parameters = parameters;
  }
}
