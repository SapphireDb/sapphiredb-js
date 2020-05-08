// @dynamic
import {UpdateRangeCommand} from '../../command/update-range/update-range-command';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {FilterFunctions} from '../../helper/filter-functions';

export class OfflineHelper {
  static handleAddCommand(command: UpdateRangeCommand, primaryKeys: string[], collectionChange: CollectionCommandBase[]): boolean {
    for (const entry of command.entries) {
      const filterFunction = FilterFunctions.comparePrimaryKeysFunction(primaryKeys, entry.value);
    }

    return true;
  }

  static handleAddUpdateCommand() {

  }
}
