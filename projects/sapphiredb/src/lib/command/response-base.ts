import {SapphireDbError} from '../models/sapphire-db-error';

export interface ResponseBase {
  responseType: string;
  referenceId: string;
  error?: SapphireDbError;
  timestamp: Date;
}
