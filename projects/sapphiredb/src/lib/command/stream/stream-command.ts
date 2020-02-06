import {CommandBase} from '../command-base';

export class StreamCommand extends CommandBase {
  streamId: string;
  frameData: any;

  constructor(streamId: string, frameData: any) {
    super('StreamCommand');
    this.streamId = streamId;
    this.frameData = frameData;
  }

}
