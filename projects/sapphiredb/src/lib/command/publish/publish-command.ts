import {CommandBase} from '../command-base';

export class PublishCommand extends CommandBase {
  topic: string;
  data: any;
  retain: boolean;

  constructor(topic: string, data: any, retain: boolean) {
    super('PublishCommand');
    this.topic = topic;
    this.data = data;
    this.retain = retain;
  }
}
