import {ReplaySubject, Subscription} from 'rxjs';

export class CollectionValue<T> {
  referenceId: string;
  subject: ReplaySubject<T[]>;
  socketSubscription: Subscription;

  constructor(referenceId: string) {
    this.referenceId = referenceId;
    this.subject = new ReplaySubject<T[]>(1);
  }

  public setSubscription(socketSubscription: Subscription) {
    this.socketSubscription = socketSubscription;
  }
}
