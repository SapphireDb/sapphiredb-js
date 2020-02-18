import {CreateResponse} from '../command/create/create-response';
import {UpdateResponse} from '../command/update/update-response';
import {DeleteResponse} from '../command/delete/delete-response';

export class CommandResult<T> {
  error: any;
  validationResults: { [propertyName: string]: string[] };

  value?: T;

  constructor(response: CreateResponse|UpdateResponse|DeleteResponse) {
    this.error = response.error;
    this.validationResults = response.validationResults;

    if (response.responseType === 'CreateResponse') {
      this.value = (<CreateResponse>response).newObject;
    } else if (response.responseType === 'UpdateResponse') {
      this.value = (<UpdateResponse>response).updatedObject;
    }
  }

  hasSuccess(): boolean {
    return !this.hasErrors() && !this.hasValidationErrors();
  }

  hasErrors(): boolean {
    return this.error;
  }

  hasValidationErrors(): boolean {
    return this.validationResults != null;
  }
}
