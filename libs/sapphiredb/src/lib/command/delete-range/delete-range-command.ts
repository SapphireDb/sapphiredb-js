import {CollectionCommandBase} from '../collection-command-base';

export class DeleteRangeCommand extends CollectionCommandBase {
  values: { [propertyName: string]: any }[];

  constructor(collectionName: string, primaryKeyList: { [propertyName: string]: any }[]) {
    super('DeleteRangeCommand', collectionName);
    this.values = primaryKeyList;
  }
}
