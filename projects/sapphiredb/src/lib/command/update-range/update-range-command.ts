import {CollectionCommandBase} from '../collection-command-base';

export class UpdateRangeCommand  extends CollectionCommandBase {
  updateValues: any[];

  constructor(collectionName: string, contextName: string, updateValues: any[]) {
    super('UpdateRangeCommand', collectionName, contextName);
    this.updateValues = updateValues;
  }
}
