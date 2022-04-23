import {Subject} from 'rxjs';
import {ResponseBase} from '../command/response-base';

export interface CommandReferences {
  [reference: string]: {
    subject$: Subject<ResponseBase>;
    keep?: boolean;
  };
}
