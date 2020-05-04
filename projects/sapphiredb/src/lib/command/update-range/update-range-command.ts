import {CollectionCommandBase} from '../collection-command-base';

export class UpdateRangeCommand extends CollectionCommandBase {
  entries: UpdateEntry[];

  constructor(collectionName: string, contextName: string, updateEntries: UpdateEntry[]) {
    super('UpdateRangeCommand', collectionName, contextName);
    this.entries = updateEntries;
  }
}

export class UpdateEntry {
  value: any;
  updatedProperties: any;

  constructor(value: any, updatedProperties: any, ) {
    this.value = value;
    this.updatedProperties = updatedProperties;
  }
}
