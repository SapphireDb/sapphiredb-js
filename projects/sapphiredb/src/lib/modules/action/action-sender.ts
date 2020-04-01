import {Observable, of, ReplaySubject} from 'rxjs';
import {ResponseBase} from '../../command/response-base';
import {ExecuteCommand} from '../../command/execute/execute-command';
import {concatMap, filter, map, take, takeWhile} from 'rxjs/operators';
import {InitStreamResponse} from '../../command/stream/init-stream-response';
import {CompleteStreamCommand} from '../../command/stream/complete-stream-command';
import {StreamCommand} from '../../command/stream/stream-command';
import {ExecuteResponse, ExecuteResponseType} from '../../command/execute/execute-response';
import {ActionResult} from './action-result';
import {ConnectionManager} from '../../connection/connection-manager';

export class ActionSender {
  public static handleActionExecution$<TResponseType = null, TNotificationType = null>(connectionManager: ConnectionManager,
                                                                                       action: string, parameters: any[])
    : Observable<ActionResult<TResponseType, TNotificationType>> {
    let sendObservable$: Observable<ResponseBase>;

    // Test to run async stream to server
    if (parameters) {
      const subjectIndex = parameters.findIndex(p => p instanceof ReplaySubject);

      if (subjectIndex !== -1) {
        const subject$: ReplaySubject<any> = parameters[subjectIndex];
        parameters[subjectIndex] = null;

        sendObservable$ = connectionManager.sendCommand(new ExecuteCommand(action, parameters), true);

        sendObservable$.pipe(
          filter(r => r.responseType === 'InitStreamResponse'),
          take(1)
        ).subscribe((initStreamResponse: InitStreamResponse) => {
          let index = 0;
          subject$.subscribe({
            complete: () => connectionManager.sendCommand(new CompleteStreamCommand(initStreamResponse.id, index++), false, true),
            error: () => connectionManager.sendCommand(new CompleteStreamCommand(initStreamResponse.id, index++, true), false, true),
            next: (value) => connectionManager.sendCommand(new StreamCommand(initStreamResponse.id, value, index++), false, true)
          });
        });
      }
    }

    if (!sendObservable$) {
      sendObservable$ = connectionManager.sendCommand(new ExecuteCommand(action, parameters), true);
    }

    return sendObservable$.pipe(
      filter(r => r.responseType !== 'InitStreamResponse'),
      concatMap((result: ExecuteResponse) => {
        if (result.type === ExecuteResponseType.End) {
          return of(result, null);
        }

        return of(result);
      }),
      takeWhile(v => !!v),
      map((result: ExecuteResponse) => {
        return new ActionResult<TResponseType, TNotificationType>(result);
      })
    );
  }
}
