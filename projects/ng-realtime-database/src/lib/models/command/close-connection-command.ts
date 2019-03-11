import {CommandBase} from './command-base';

export class CloseConnectionCommand extends CommandBase {
  connectionId: string;
  deleteRenewToken?: boolean;

  constructor(connectionId: string, deleteRenewToken?: boolean) {
    super('CloseConnectionCommand');
    this.connectionId = connectionId;
    this.deleteRenewToken = deleteRenewToken;
  }
}
