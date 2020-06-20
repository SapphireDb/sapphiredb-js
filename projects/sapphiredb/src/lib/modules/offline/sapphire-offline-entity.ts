import {GuidHelper} from '../../helper/guid-helper';
import {PrimaryKey} from '../../helper/decorators/primary-key';

export class SapphireOfflineEntity {
  @PrimaryKey()
  public id: string;
  protected modifiedOn?: Date;

  constructor() {
    this.id = GuidHelper.generateGuid();
    this.modifiedOn = undefined;
  }
}
