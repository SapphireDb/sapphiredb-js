import {CommandBase} from '../command-base';

export class CompleteStreamCommand extends CommandBase {
  private streamId: string;

  constructor(streamId: string) {
    super('CompleteStreamCommand');
    this.streamId = streamId;
  }
}
