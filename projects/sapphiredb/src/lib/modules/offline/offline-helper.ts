// @dynamic
import {UpdateEntry, UpdateRangeCommand} from '../../command/update-range/update-range-command';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {FilterFunctions} from '../../helper/filter-functions';
import {CreateRangeCommand} from '../../command/create-range/create-range-command';
import {DeleteRangeCommand} from '../../command/delete-range/delete-range-command';

export class OfflineHelper {
  static getCommandIndexWithSameValue(filterFunction: (any) => boolean, commands: CollectionCommandBase[]) {
    return commands.findIndex((command: CreateRangeCommand | UpdateRangeCommand | DeleteRangeCommand) => {
      const values = command.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand>command).entries.map(e => e.value)
        : (<CreateRangeCommand>command).values;

      return values.findIndex(v => filterFunction(v)) !== -1;
    });
  }

  static handleAddCommand(command: DeleteRangeCommand|UpdateRangeCommand|CreateRangeCommand, primaryKeys: string[],
                          collectionChanges: CollectionCommandBase[]): boolean {
    if (command.commandType === 'UpdateRangeCommand') {
      const updateCommand = <UpdateRangeCommand> command;

      for (const entry of updateCommand.entries) {
        const filterFunction = FilterFunctions.comparePrimaryKeysFunction(primaryKeys, entry.value);
        const commandIndexWithSameValue = this.getCommandIndexWithSameValue(filterFunction, collectionChanges);

        if (commandIndexWithSameValue !== -1) {
          if (this.handleAddUpdateCommand(entry, collectionChanges, commandIndexWithSameValue, filterFunction)) {
            updateCommand.entries = updateCommand.entries.filter(v => !filterFunction(v.value));

            if (updateCommand.entries.length === 0) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  static handleAddUpdateCommand(entry: UpdateEntry, collectionChanges: CollectionCommandBase[], commandIndex: number,
                                filterFunction: (any) => boolean): boolean {
    const commandWithSameValue = <CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand>collectionChanges[commandIndex];

    if (commandWithSameValue.commandType === 'UpdateRangeCommand') {
      const updateRangeCommand = <UpdateRangeCommand>commandWithSameValue;
      const valueIndex = updateRangeCommand.entries.findIndex(v => filterFunction(v.value));
      const oldUpdateEntry = updateRangeCommand.entries[valueIndex];

      // Merge changes of both update entries
      updateRangeCommand.entries[valueIndex] = new UpdateEntry(oldUpdateEntry.value, { ...oldUpdateEntry.updatedProperties, ...entry.updatedProperties });
      return true;
    }

    return false;
  }
}
