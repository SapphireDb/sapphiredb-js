import {ResponseBase} from './response-base';

export interface CheckAuthResponse extends ResponseBase {
  authenticated: boolean;
}
