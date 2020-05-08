import {CollectionCommandBase} from '../collection-command-base';

export class CreateRangeCommand extends CollectionCommandBase {
  values: any[];

  constructor(collectionName: string, values: any[]) {
    super('CreateRangeCommand', collectionName);
    this.values = values;
  }
}
