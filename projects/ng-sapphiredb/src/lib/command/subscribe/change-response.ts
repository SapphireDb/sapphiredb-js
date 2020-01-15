import {ResponseBase} from '../response-base';

export interface ChangeResponse extends ResponseBase {
  state: ChangeState;
  value: any;
}

export interface ChangeResponses extends ResponseBase {
  changes: ChangeResponse[];
}

export enum ChangeState {
  Added, Deleted, Modified
}
