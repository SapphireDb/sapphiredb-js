import {ActionResult} from '../models/action-result';
import {ExecuteResponseType} from '../models/response/execute-response';

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
