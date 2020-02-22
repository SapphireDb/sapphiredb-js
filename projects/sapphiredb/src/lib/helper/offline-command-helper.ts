import {CollectionCommandBase} from '../command/collection-command-base';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {FilterFunctions} from './filter-functions';
import {UpdateEntry, UpdateRangeCommand} from '../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../command/delete-range/delete-range-command';
import {InfoResponse} from '../command/info/info-response';

// @dynamic
export class OfflineCommandHelper {
  static getCommandIndexWithSameValue(filterFunction: (any) => boolean, commands: CollectionCommandBase[]) {
    return commands.findIndex((command: CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand) => {
      const values = command.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand>command).entries.map(e => e.value)
        : (<CreateRangeCommand>command).values;

      return values.findIndex(v => filterFunction(v)) !== -1;
    });
  }

  static handleAddDeleteCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean)
    : boolean {
    const commandWithSameValue = <CreateRangeCommand|UpdateRangeCommand>changes[commandIndex];

    if (commandWithSameValue.commandType === 'UpdateRangeCommand') {
      const updateRangeCommand = <UpdateRangeCommand>commandWithSameValue;

      updateRangeCommand.entries = updateRangeCommand.entries.filter(v => !filterFunction(v.value));
      if (updateRangeCommand.entries.length === 0) {
        changes.splice(commandIndex, 1);
      }
    } else if (commandWithSameValue.commandType === 'CreateRangeCommand') {
      const createRangeCommand = <CreateRangeCommand>commandWithSameValue;

      createRangeCommand.values = createRangeCommand.values.filter(v => !filterFunction(v));
      if (createRangeCommand.values.length === 0) {
        changes.splice(commandIndex, 1);
      }

      return true;
    }

    return false;
  }

  static handleAddUpdateCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean) {
    const commandWithSameValue = <CreateRangeCommand|UpdateRangeCommand>changes[commandIndex];

    if (commandWithSameValue.commandType === 'CreateRangeCommand') {
      const createRangeCommand = <CreateRangeCommand>commandWithSameValue;
      const valueIndex = createRangeCommand.values.findIndex(v => filterFunction(v));
      createRangeCommand.values[valueIndex] = value;
    } else if (commandWithSameValue.commandType === 'UpdateRangeCommand') {
      const updateRangeCommand = <UpdateRangeCommand>commandWithSameValue;
      const valueIndex = updateRangeCommand.entries.findIndex(v => filterFunction(v.value));
      updateRangeCommand.entries[valueIndex] = new UpdateEntry(value, updateRangeCommand.entries[valueIndex].previous);
    }
  }

  static handleAddCommand(rangeCommand: CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand, info: InfoResponse,
                          collectionChanges: CollectionCommandBase[]): boolean {
    const values = rangeCommand.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand>rangeCommand).entries.map(e => e.value)
      : (<CreateRangeCommand>rangeCommand).values;

    for (const value of values) {
      const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, value);
      const commandIndexWithSameValue = OfflineCommandHelper.getCommandIndexWithSameValue(filterFunction, collectionChanges);

      if (commandIndexWithSameValue !== -1) {
        if (rangeCommand.commandType === 'DeleteRangeCommand') {
          const removeCommand = OfflineCommandHelper.handleAddDeleteCommand(value, collectionChanges, commandIndexWithSameValue,
            filterFunction);

          if (removeCommand) {
            const deleteRangeCommand = <DeleteRangeCommand>rangeCommand;

            deleteRangeCommand.values = deleteRangeCommand.values.filter(v => !filterFunction(v));
            if (deleteRangeCommand.values.length === 0) {
              return false;
            }
          }

        } else if (rangeCommand.commandType === 'UpdateRangeCommand') {
          const updateRangeCommand = <UpdateRangeCommand>rangeCommand;
          OfflineCommandHelper.handleAddUpdateCommand(value, collectionChanges, commandIndexWithSameValue, filterFunction);

          updateRangeCommand.entries = updateRangeCommand.entries.filter(v => !filterFunction(v.value));
          if (updateRangeCommand.entries.length === 0) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
