import {CommandBase} from '../command-base';

export class StreamCommand extends CommandBase {
  streamId: string;
  frameData: any;
  index: number;

  constructor(streamId: string, frameData: any, index: number) {
    super('StreamCommand');
    this.streamId = streamId;
    this.frameData = frameData;
    this.index = index;
  }

}
