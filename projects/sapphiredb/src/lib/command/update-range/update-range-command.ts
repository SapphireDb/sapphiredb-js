import {CollectionCommandBase} from '../collection-command-base';

export class UpdateRangeCommand  extends CollectionCommandBase {
  values: any[];

  constructor(collectionName: string, contextName: string, updateValues: any[]) {
    super('UpdateRangeCommand', collectionName, contextName);
    this.values = updateValues;
  }
}
