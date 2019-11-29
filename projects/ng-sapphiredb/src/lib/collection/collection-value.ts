import {ReplaySubject, Subscription} from 'rxjs';

export class CollectionValue<T> {
  referenceId: string;
  subject: ReplaySubject<T[]>;
  socketSubscription: Subscription;

  constructor(referenceId: string) {
    this.referenceId = referenceId;
    this.subject = new ReplaySubject<T[]>(null);
  }

  public setSubscription(socketSubscription: Subscription) {
    this.socketSubscription = socketSubscription;
  }
}
