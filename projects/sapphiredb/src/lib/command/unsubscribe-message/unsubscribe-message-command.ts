import {CommandBase} from '../command-base';

export class UnsubscribeMessageCommand extends CommandBase {
  constructor(referenceId: string) {
    super('UnsubscribeMessageCommand');
    this.referenceId = referenceId;
  }
}
