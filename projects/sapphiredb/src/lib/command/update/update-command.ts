import {CollectionCommandBase} from '../collection-command-base';

export class UpdateCommand  extends CollectionCommandBase {
  value: any;

  constructor(collectionName: string, contextName: string, updateValue: any) {
    super('UpdateCommand', collectionName, contextName);
    this.value = updateValue;
  }
}
