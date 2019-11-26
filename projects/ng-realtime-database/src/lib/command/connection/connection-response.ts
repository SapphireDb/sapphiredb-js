import {ResponseBase} from '../response-base';

export interface ConnectionResponse extends ResponseBase {
  connectionId: string;
  bearerValid: boolean;
}
