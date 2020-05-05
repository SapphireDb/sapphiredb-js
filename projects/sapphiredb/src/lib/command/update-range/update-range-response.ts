import {ResponseBase} from '../response-base';
import {ValidatedResponseBase} from '../validated-response-base';
import {CreateResponse} from '../create-range/create-range-response';

export interface UpdateRangeResponse extends ResponseBase {
  results: (UpdateResponse|CreateResponse)[];
}

export interface UpdateResponse extends ValidatedResponseBase {
  value: any;
  updatedProperties: any;
}
