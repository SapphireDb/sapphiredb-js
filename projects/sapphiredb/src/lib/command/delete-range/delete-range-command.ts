import {CollectionCommandBase} from '../collection-command-base';

export class DeleteRangeCommand extends CollectionCommandBase {
  values: { [propertyName: string]: any }[];

  constructor(collectionName: string, contextName: string, primaryKeyList: { [propertyName: string]: any }[]) {
    super('DeleteRangeCommand', collectionName, contextName);
    this.values = primaryKeyList;
  }
}
