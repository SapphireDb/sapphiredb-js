import {CommandResult} from './command-result';

export class CommandResults<T> {
  results: CommandResult<T>[];

  constructor(results: CommandResult<T>[]) {
    this.results = results;
  }

  hasSuccess(): boolean {
    return !this.hasErrors() && !this.hasValidationErrors();
  }

  hasErrors(): boolean {
    return this.results.findIndex(v => !!v.error) !== -1;
  }

  hasValidationErrors(): boolean {
    return this.results.findIndex(v => !!v.validationResults) !== -1;
  }
}
