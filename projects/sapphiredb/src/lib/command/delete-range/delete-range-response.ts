import {ResponseBase} from '../response-base';
import {DeleteResponse} from '../delete/delete-response';

export interface DeleteRangeResponse extends ResponseBase {
  results: DeleteResponse[];
}
