import {SapphireDbErrorResponse} from './sapphire-db-error-response';

export interface ResponseBase {
  responseType: string;
  referenceId: string;
  error?: SapphireDbErrorResponse;
  timestamp: Date;
}
