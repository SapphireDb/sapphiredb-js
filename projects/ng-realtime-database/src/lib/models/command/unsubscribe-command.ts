import {CollectionCommandBase} from './collection-command-base';

export class UnsubscribeCommand extends CollectionCommandBase {
  constructor(collectionName: string, contextName: string, referenceId: string) {
    super('UnsubscribeCommand', contextName, collectionName);
    this.referenceId = referenceId;
  }
}
