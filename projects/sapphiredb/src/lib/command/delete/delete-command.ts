import {CollectionCommandBase} from '../collection-command-base';

export class DeleteCommand extends CollectionCommandBase {
  value: { [propertyName: string]: any };

  constructor(collectionName: string, contextName: string, primaryKeys: { [propertyName: string]: any }) {
    super('DeleteCommand', collectionName, contextName);
    this.value = primaryKeys;
  }
}
