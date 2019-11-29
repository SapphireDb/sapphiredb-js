import {ActionResult} from '../modules/action/action-result';
import {ExecuteResponseType} from '../command/execute/execute-response';

// @dynamic
export class ActionHelper {
  public static result<ResultType, NotificationType>(completeFn: (result: ResultType) => void, notifyFn: (notification: NotificationType) => void) {
    return (result: ActionResult<ResultType, NotificationType>) => {
      if (result.type === ExecuteResponseType.End) {
        completeFn(result.result);
      } else {
        notifyFn(result.notification);
      }
    };
  }
}
