import {CollectionCommandBase} from '../collection-command-base';

export class UpdateRangeCommand extends CollectionCommandBase {
  entries: UpdateEntry[];

  constructor(collectionName: string, contextName: string, updateEntries: UpdateEntry[]) {
    super('UpdateRangeCommand', collectionName, contextName);
    this.entries = updateEntries;
  }
}

export class UpdateEntry {
  value: any;
  previous?: any;
  // changes: { [key: string]: { from: any, to: any } };

  constructor(value: any, previous?: any) {
    this.value = value;
    this.previous = previous;

    // if (!!prevValue) {
    //   this.changes = {};
    //   Object.keys(prevValue).forEach(key => {
    //     if (prevValue[key] !== value[key]) {
    //       this.changes[key] = {
    //         from: prevValue[key],
    //         to: value[key]
    //       };
    //     }
    //   });
    //
    //   console.log(value, prevValue, this.changes);
    // }
  }
}
