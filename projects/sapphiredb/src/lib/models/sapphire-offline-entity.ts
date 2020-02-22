import {GuidHelper} from '../helper/guid-helper';

export class SapphireOfflineEntity {
  id: string;
  createdOn: Date;
  updatedOn: Date;

  constructor() {
    this.id = GuidHelper.generateGuid();
  }
}
