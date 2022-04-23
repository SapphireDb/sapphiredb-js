import {ReplaySubject, Subscription} from 'rxjs';

export interface CollectionValueContainer<T> {
  connectionId?: string;
  values: T[];
}

export class CollectionValue<T> {
  referenceId: string;
  subject: ReplaySubject<CollectionValueContainer<T>>;
  socketSubscription?: Subscription;

  constructor(referenceId: string) {
    this.referenceId = referenceId;
    this.subject = new ReplaySubject<CollectionValueContainer<T>>(1);
  }

  public setSubscription(socketSubscription: Subscription) {
    this.socketSubscription = socketSubscription;
  }
}
