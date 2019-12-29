import {ResponseBase} from '../response-base';

export interface InfoResponse extends ResponseBase {
  primaryKeys: string[];
}
