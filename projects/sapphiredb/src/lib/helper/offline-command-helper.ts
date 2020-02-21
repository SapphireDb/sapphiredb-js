import {CollectionCommandBase} from '../command/collection-command-base';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {CreateCommand} from '../command/create/create-command';
import {FilterFunctions} from './filter-functions';
import {UpdateRangeCommand} from '../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../command/delete-range/delete-range-command';
import {UpdateCommand} from '../command/update/update-command';
import {DeleteCommand} from '../command/delete/delete-command';
import {InfoResponse} from '../command/info/info-response';

// @dynamic
export class OfflineCommandHelper {
  static getCommandIndexWithSameValue(filterFunction: (any) => boolean, commands: CollectionCommandBase[]) {
    return commands.findIndex((command) => {
      if (this.isRangeCommand(command)) {
        const rangeCommand = <CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand>command;
        return rangeCommand.values.findIndex(v => filterFunction(v)) !== -1;
      } else {
        const singleCommand = <CreateCommand|UpdateCommand|DeleteCommand>command;
        return filterFunction(singleCommand.value);
      }
    });
  }

  static isRangeCommand(command: CollectionCommandBase): boolean {
    return command.commandType.indexOf('Range') !== -1;
  }

  static handleAddDeleteCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean): boolean {
    const commandWithSameValue = changes[commandIndex];

    if (OfflineCommandHelper.isRangeCommand(commandWithSameValue)) {
      const commandWithSameValueRangeCommand = <CreateRangeCommand|UpdateRangeCommand>commandWithSameValue;
      commandWithSameValueRangeCommand.values = commandWithSameValueRangeCommand.values.filter(v => !filterFunction(v));
      if (commandWithSameValueRangeCommand.values.length === 0) {
        changes.splice(commandIndex, 1);
      }

      if (commandWithSameValueRangeCommand.commandType === 'CreateRangeCommand') {
        return true;
      }
    } else {
      changes.splice(commandIndex, 1);

      if (commandWithSameValue.commandType === 'CreateCommand') {
        return true;
      }
    }

    return false;
  }

  static handleAddUpdateCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean) {
    const commandWithSameValue = changes[commandIndex];

    if (OfflineCommandHelper.isRangeCommand(commandWithSameValue)) {
      if (commandWithSameValue.commandType === 'CreateRangeCommand' || commandWithSameValue.commandType === 'UpdateRangeCommand') {
        const commandWithSameValueRangeCommand = <CreateRangeCommand|UpdateRangeCommand>commandWithSameValue;
        const valueIndex = commandWithSameValueRangeCommand.values.findIndex(v => filterFunction(v));
        commandWithSameValueRangeCommand.values[valueIndex] = value;
      }
    } else {
      if (commandWithSameValue.commandType === 'CreateCommand' || commandWithSameValue.commandType === 'UpdateCommand') {
        (<CreateCommand|UpdateCommand>commandWithSameValue).value = value;
      }
    }
  }

  static handleAddCommand(command: CollectionCommandBase, info: InfoResponse, collectionChanges: CollectionCommandBase[]): boolean {
    if (OfflineCommandHelper.isRangeCommand(command)) {
      const rangeCommand = <CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand>command;

      for (const value of rangeCommand.values) {
        const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, value);
        const commandIndexWithSameValue = OfflineCommandHelper.getCommandIndexWithSameValue(filterFunction, collectionChanges);

        if (commandIndexWithSameValue !== -1) {
          if (rangeCommand.commandType === 'DeleteRangeCommand') {
            const removeCommand = OfflineCommandHelper.handleAddDeleteCommand(value, collectionChanges, commandIndexWithSameValue, filterFunction);

            if (removeCommand) {
              rangeCommand.values = rangeCommand.values.filter(v => !filterFunction(v));
              if (rangeCommand.values.length === 0) {
                return false;
              }
            }

          } else if (rangeCommand.commandType === 'UpdateRangeCommand') {
            OfflineCommandHelper.handleAddUpdateCommand(value, collectionChanges, commandIndexWithSameValue, filterFunction);

            rangeCommand.values = rangeCommand.values.filter(v => !filterFunction(v));
            if (rangeCommand.values.length === 0) {
              return false;
            }
          }
        }
      }
    } else {
      const singleCommand = <CreateCommand|UpdateCommand|DeleteCommand>command;
      const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, singleCommand.value);
      const commandIndexWithSameValue = OfflineCommandHelper.getCommandIndexWithSameValue(filterFunction, collectionChanges);

      if (commandIndexWithSameValue !== -1) {
        if (singleCommand.commandType === 'DeleteCommand') {
          return !OfflineCommandHelper.handleAddDeleteCommand(singleCommand.value, collectionChanges, commandIndexWithSameValue, filterFunction);
        } else if (singleCommand.commandType === 'UpdateCommand') {
          OfflineCommandHelper.handleAddUpdateCommand(singleCommand.value, collectionChanges, commandIndexWithSameValue, filterFunction);
          return false;
        }
      }
    }

    return true;
  }
}
