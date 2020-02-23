import {GuidHelper} from '../helper/guid-helper';

export class SapphireOfflineEntity {
  public id: string;
  protected modifiedOn: Date;

  constructor() {
    this.id = GuidHelper.generateGuid();
    this.modifiedOn = new Date();
  }
}
