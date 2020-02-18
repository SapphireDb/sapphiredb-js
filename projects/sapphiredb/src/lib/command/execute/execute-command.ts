import {CommandBase} from '../command-base';

export class ExecuteCommand extends CommandBase {
  action: string;
  parameters: any[];

  constructor(action: string, parameters: any[]) {
    super('ExecuteCommand');
    this.action = action;
    this.parameters = parameters;
  }
}
