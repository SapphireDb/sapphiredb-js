import {CollectionCommandBase} from './collection-command-base';

export class InfoCommand extends CollectionCommandBase {
  constructor(collectionName: string, contextName: string) {
    super('InfoCommand', collectionName, contextName);
  }
}
