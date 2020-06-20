import {UpdateEntry, UpdateRangeCommand} from '../../command/update-range/update-range-command';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {FilterFunctions} from '../../helper/filter-functions';
import {CreateRangeCommand} from '../../command/create-range/create-range-command';
import {DeleteRangeCommand} from '../../command/delete-range/delete-range-command';

// @dynamic
export class OfflineHelper {
  static getCommandIndexWithSameValue(filterFunction: (any) => boolean, commands: CollectionCommandBase[]) {
    return commands.findIndex((command: CreateRangeCommand | UpdateRangeCommand | DeleteRangeCommand) => {
      const values = command.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand>command).entries.map(e => e.value)
        : (<CreateRangeCommand>command).values;

      return values.findIndex(v => filterFunction(v)) !== -1;
    });
  }

  static handleAddCommand(command: DeleteRangeCommand | UpdateRangeCommand | CreateRangeCommand, primaryKeys: string[],
                          collectionChanges: CollectionCommandBase[]): boolean {
    if (command.commandType === 'UpdateRangeCommand') {
      const updateCommand = <UpdateRangeCommand>command;

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
    } else if (command.commandType === 'DeleteRangeCommand') {
      const deleteCommand = <DeleteRangeCommand>command;

      for (const value of deleteCommand.values) {
        const filterFunction = FilterFunctions.comparePrimaryKeysFunction(primaryKeys, value);
        const commandIndexWithSameValue = this.getCommandIndexWithSameValue(filterFunction, collectionChanges);

        if (commandIndexWithSameValue !== -1) {
          if (this.handleAddDeleteCommand(value, collectionChanges, commandIndexWithSameValue, filterFunction)) {
            deleteCommand.values = deleteCommand.values.filter(v => !filterFunction(v));

            if (deleteCommand.values.length === 0) {
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
    const commandWithSameValue = <CreateRangeCommand | UpdateRangeCommand | DeleteRangeCommand>collectionChanges[commandIndex];

    if (commandWithSameValue.commandType === 'UpdateRangeCommand') {
      const updateRangeCommand = <UpdateRangeCommand>commandWithSameValue;
      const valueIndex = updateRangeCommand.entries.findIndex(v => filterFunction(v.value));
      const oldUpdateEntry = updateRangeCommand.entries[valueIndex];

      updateRangeCommand.entries[valueIndex] = new UpdateEntry(oldUpdateEntry.value, {
        ...oldUpdateEntry.updatedProperties,
        ...entry.updatedProperties
      });
      return true;
    } else if (commandWithSameValue.commandType === 'CreateRangeCommand') {
      const createRangeCommand = <CreateRangeCommand>commandWithSameValue;
      const valueIndex = createRangeCommand.values.findIndex(v => filterFunction(v));
      createRangeCommand.values[valueIndex] = {
        ...createRangeCommand.values[valueIndex],
        ...entry.updatedProperties
      };
      return true;
    }

    return false;
  }

  static handleAddDeleteCommand(value: any, collectionChanges: CollectionCommandBase[], commandIndex: number,
                                filterFunction: (any) => boolean): boolean {
    const commandWithSameValue = <CreateRangeCommand | UpdateRangeCommand | DeleteRangeCommand>collectionChanges[commandIndex];

    if (commandWithSameValue.commandType === 'UpdateRangeCommand') {
      const updateRangeCommand = <UpdateRangeCommand>commandWithSameValue;

      updateRangeCommand.entries = updateRangeCommand.entries.filter(v => !filterFunction(v.value));
      if (updateRangeCommand.entries.length === 0) {
        collectionChanges.splice(commandIndex, 1);
      }
    } else if (commandWithSameValue.commandType === 'CreateRangeCommand') {
      const createRangeCommand = <CreateRangeCommand>commandWithSameValue;

      createRangeCommand.values = createRangeCommand.values.filter(v => !filterFunction(v));
      if (createRangeCommand.values.length === 0) {
        collectionChanges.splice(commandIndex, 1);
      }

      return true;
    }

    return false;
  }
}
