import {ResponseBase} from '../response-base';

export interface ChangeResponse extends ResponseBase {
  state: ChangeState;
  value: any;
  changes?: any;
}

export interface ChangesResponse extends ResponseBase {
  changes: ChangeResponse[];
}

export enum ChangeState {
  Added, Deleted, Modified
}
