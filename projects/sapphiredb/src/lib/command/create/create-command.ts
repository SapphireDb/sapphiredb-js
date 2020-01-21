import {CollectionCommandBase} from '../collection-command-base';

export class CreateCommand extends CollectionCommandBase {
  value: any;

  constructor(collectionName: string, contextName: string, value: any) {
    super('CreateCommand', collectionName, contextName);
    this.value = value;
  }
}
