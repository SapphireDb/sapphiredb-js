import {CommandBase} from '../command-base';

export class UnsubscribeCommand extends CommandBase {
  constructor(referenceId: string) {
    super('UnsubscribeCommand');
    this.referenceId = referenceId;
  }
}
