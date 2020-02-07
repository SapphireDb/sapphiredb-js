import {CommandBase} from '../command-base';

export class CompleteStreamCommand extends CommandBase {
  private streamId: string;
  private index: number;
  private error: boolean;

  constructor(streamId: string, index: number, error: boolean = false) {
    super('CompleteStreamCommand');
    this.streamId = streamId;
    this.index = index;
    this.error = error;
  }
}
