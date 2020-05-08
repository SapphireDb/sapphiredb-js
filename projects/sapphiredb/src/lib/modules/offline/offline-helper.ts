// @dynamic
import {UpdateRangeCommand} from '../../command/update-range/update-range-command';
import {InfoResponse} from '../../command/info/info-response';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {FilterFunctions} from '../../helper/filter-functions';

export class OfflineHelper {
  static handleAddCommand(command: UpdateRangeCommand, info: InfoResponse, collectionChange: CollectionCommandBase[]): boolean {
    for (const entry of command.entries) {
      const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, entry.value);
    }

    return true;
  }

  static handleAddUpdateCommand() {

  }
}
