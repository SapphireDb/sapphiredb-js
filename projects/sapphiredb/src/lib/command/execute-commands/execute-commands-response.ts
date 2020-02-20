import {ResponseBase} from '../response-base';
import {CommandBase} from '../command-base';

export interface ExecuteCommandsResponse extends ResponseBase {
  results: ExecuteCommandsResultResponse[];
}

export interface ExecuteCommandsResultResponse extends ResponseBase {
  command: CommandBase;
  response: ResponseBase;
}
