import {ActionResult} from '../modules/action/action-result';
import {ExecuteResponseType} from '../command/execute/execute-response';

// @dynamic
export class ActionHelper {
  public static result<ResultType, NotificationType = null>(completeFn?: (result: ResultType) => void, asyncFn?: (result: ResultType) => void, notifyFn?: (notification: NotificationType) => void) {
    return (result: ActionResult<ResultType, NotificationType>) => {
      if (result.type === ExecuteResponseType.End) {
        if (completeFn) {
          completeFn(result.result);
        }
      } else if (result.type === ExecuteResponseType.Async) {
        if (asyncFn) {
          asyncFn(result.result);
        }
      } else if (result.type === ExecuteResponseType.Notify) {
        if (notifyFn) {
          notifyFn(result.notification);
        }
      }
    };
  }
}
