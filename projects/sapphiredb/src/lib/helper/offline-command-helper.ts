import {CollectionCommandBase} from '../command/collection-command-base';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {FilterFunctions} from './filter-functions';
import {UpdateRangeCommand} from '../command/update-range/update-range-command';
import {DeleteRangeCommand} from '../command/delete-range/delete-range-command';
import {InfoResponse} from '../command/info/info-response';

// @dynamic
export class OfflineCommandHelper {
  static getCommandIndexWithSameValue(filterFunction: (any) => boolean, commands: CollectionCommandBase[]) {
    return commands.findIndex((command: CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand) => {
      return command.values.findIndex(v => filterFunction(v)) !== -1;
    });
  }

  static handleAddDeleteCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean)
    : boolean {
    const commandWithSameValue = <CreateRangeCommand|UpdateRangeCommand>changes[commandIndex];

    const commandWithSameValueRangeCommand = <CreateRangeCommand|UpdateRangeCommand>commandWithSameValue;
    commandWithSameValueRangeCommand.values = commandWithSameValueRangeCommand.values.filter(v => !filterFunction(v));
    if (commandWithSameValueRangeCommand.values.length === 0) {
      changes.splice(commandIndex, 1);
    }

    return commandWithSameValueRangeCommand.commandType === 'CreateRangeCommand';
  }

  static handleAddUpdateCommand(value: any, changes: CollectionCommandBase[], commandIndex: number, filterFunction: (any) => boolean) {
    const commandWithSameValue = <CreateRangeCommand|UpdateRangeCommand>changes[commandIndex];

    const commandWithSameValueRangeCommand = <CreateRangeCommand|UpdateRangeCommand>commandWithSameValue;
    const valueIndex = commandWithSameValueRangeCommand.values.findIndex(v => filterFunction(v));
    commandWithSameValueRangeCommand.values[valueIndex] = Object.assign(commandWithSameValueRangeCommand.values[valueIndex], value);
  }

  static handleAddCommand(rangeCommand: CreateRangeCommand|UpdateRangeCommand|DeleteRangeCommand, info: InfoResponse, collectionChanges: CollectionCommandBase[]): boolean {
    for (const value of rangeCommand.values) {
      const filterFunction = FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, value);
      const commandIndexWithSameValue = OfflineCommandHelper.getCommandIndexWithSameValue(filterFunction, collectionChanges);

      if (commandIndexWithSameValue !== -1) {
        if (rangeCommand.commandType === 'DeleteRangeCommand') {
          const removeCommand = OfflineCommandHelper.handleAddDeleteCommand(value, collectionChanges, commandIndexWithSameValue,
            filterFunction);

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

    return true;
  }
}
