import {CommandBase} from '../command-base';

export class ExecuteCommandsCommand extends CommandBase {
  commands: CommandBase[];

  constructor(commands: CommandBase[]) {
    super('ExecuteCommandsCommand');
    this.commands = commands;
  }
}
