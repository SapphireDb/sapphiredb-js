import {ValidatedResponseBase} from '../../command/validated-response-base';

export interface OfflineResponse extends ValidatedResponseBase {
  value?: any;
  results?: OfflineResponse[];
}
