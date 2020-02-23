import {ResponseBase} from '../response-base';
import {ValidatedResponseBase} from '../validated-response-base';

export interface DeleteRangeResponse extends ResponseBase {
  results: DeleteResponse[];
}

export interface DeleteResponse extends ValidatedResponseBase {
  value: any;
}
