import {ValidatedResponseBase} from '../../command/validated-response-base';
import {UpdateResponse} from '../../command/update-range/update-range-response';
import {CreateResponse} from '../../command/create-range/create-range-response';
import {DeleteResponse} from '../../command/delete-range/delete-range-response';

export interface OfflineResponse extends ValidatedResponseBase {
  results?: (CreateResponse|UpdateResponse|DeleteResponse)[];
}
