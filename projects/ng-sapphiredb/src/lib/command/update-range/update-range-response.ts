import {UpdateResponse} from '../update/update-response';
import {ResponseBase} from '../response-base';

export interface UpdateRangeResponse extends ResponseBase {
  results: UpdateResponse[];
}
