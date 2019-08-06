import {CommandBase} from './command-base';

export class CollectionCommandBase extends CommandBase {
  collectionName: string;
  contextName: string;

  constructor(commandType: string, collectionName: string, contextName: string) {
    super(commandType);
    this.collectionName = collectionName;
    this.contextName = contextName;
  }
}
