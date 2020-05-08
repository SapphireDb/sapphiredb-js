import {GuidHelper} from '../../helper/guid-helper';
import {primaryKey} from '../../helper/decorators/primary-key';

export class SapphireOfflineEntity {
  @primaryKey()
  public id: string;
  protected modifiedOn: Date;

  constructor() {
    this.id = GuidHelper.generateGuid();
    this.modifiedOn = undefined;
  }
}
