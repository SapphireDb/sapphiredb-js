import {CollectionCommandBase} from '../collection-command-base';

export class DeleteRangeCommand extends CollectionCommandBase {
  primaryKeyList: { [propertyName: string]: any }[];

  constructor(collectionName: string, contextName: string, primaryKeyList: { [propertyName: string]: any }[]) {
    super('DeleteRangeCommand', collectionName, contextName);
    this.primaryKeyList = primaryKeyList;
  }
}
