import {ResponseBase} from '../response-base';
import {UserData} from '../../modules/auth/user-data';

export interface SubscribeUsersResponse extends ResponseBase {
  users: UserData[];
}
