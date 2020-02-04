import {GuidHelper} from '../helper/guid-helper';

export class CommandBase {
  commandType: string;
  referenceId: string;
  timestamp: Date;

  constructor(commandType: string) {
    this.commandType = commandType;
    this.referenceId = GuidHelper.generateGuid();
    this.timestamp = new Date();
  }
}
