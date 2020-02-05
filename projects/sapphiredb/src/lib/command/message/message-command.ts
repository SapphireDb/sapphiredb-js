import {CommandBase} from '../command-base';

export class MessageCommand extends CommandBase {
  data: any;
  filter: string;
  filterParameters: any[];

  constructor(data: any, filter?: string, filterParamters?: any[]) {
    super('MessageCommand');
    this.data = data;
    this.filter = filter;
    this.filterParameters = filterParamters;
  }
}
