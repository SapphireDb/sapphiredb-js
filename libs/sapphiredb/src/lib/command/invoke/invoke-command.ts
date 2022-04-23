import {CollectionCommandBase} from '../collection-command-base';

export class InvokeCommand extends CollectionCommandBase {
  primaryKeys: { [propertyName: string]: any };
  action: string;

  parameters: any[];

  constructor(collectionName: string, action: string, primaryKeys: { [propertyName: string]: any }, parameters: any[]) {
    super('InvokeCommand', collectionName);
    this.action = action;
    this.primaryKeys = primaryKeys;
    this.parameters = parameters;
  }
}
