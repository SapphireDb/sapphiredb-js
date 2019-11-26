import {ResponseBase} from '../response-base';
import {RoleData} from '../../modules/auth/role-data';

export interface SubscribeRolesResponse extends ResponseBase {
  roles: RoleData[];
}
