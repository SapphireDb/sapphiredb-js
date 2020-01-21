import {CommandBase} from '../command/command-base';

export interface SubscribeCommandInfo {
  sendWithAuthToken: boolean;
  command: CommandBase;
}
