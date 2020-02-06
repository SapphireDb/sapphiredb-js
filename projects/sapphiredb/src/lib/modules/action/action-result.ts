import {ExecuteResponse, ExecuteResponseType} from '../../command/execute/execute-response';

export class ActionResult<X, Y> {
  type: ExecuteResponseType;
  result: X;
  notification: Y;

  constructor (response: ExecuteResponse) {
    this.type = response.type;

    if (response.type === ExecuteResponseType.End || response.type === ExecuteResponseType.Async) {
      this.result = response.result;
    } else if (response.type === ExecuteResponseType.Notify) {
      this.notification = response.result;
    }
  }
}
