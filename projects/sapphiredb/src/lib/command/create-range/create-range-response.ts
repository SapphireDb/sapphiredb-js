import {CreateResponse} from '../create/create-response';
import {ResponseBase} from '../response-base';

export interface CreateRangeResponse extends ResponseBase {
  results: CreateResponse[];
}
