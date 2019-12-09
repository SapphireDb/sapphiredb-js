import {CollectionCommandBase} from '../collection-command-base';

export class CreateRangeCommand extends CollectionCommandBase {
  values: any[];

  constructor(collectionName: string, contextName: string, values: any[]) {
    super('CreateRangeCommand', collectionName, contextName);
    this.values = values;
  }
}
