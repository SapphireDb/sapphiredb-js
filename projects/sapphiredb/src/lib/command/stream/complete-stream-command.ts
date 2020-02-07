import {CommandBase} from '../command-base';

export class CompleteStreamCommand extends CommandBase {
  private streamId: string;
  private index: number;

  constructor(streamId: string, index: number) {
    super('CompleteStreamCommand');
    this.streamId = streamId;
    this.index = index;
  }
}
