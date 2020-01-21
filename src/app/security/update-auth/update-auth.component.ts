import { Component, OnInit } from '@angular/core';
import {DefaultCollection} from 'sapphiredb';
import { SapphireDb } from 'ng-sapphiredb';
import {UserStateService} from '../user-state.service';
import {Observable, of} from 'rxjs';
import {catchError, map, shareReplay, switchMap, take} from 'rxjs/operators';

@Component({
  selector: 'app-update-auth',
  templateUrl: './update-auth.component.html',
  styleUrls: ['./update-auth.component.less']
})
export class UpdateAuthComponent implements OnInit {

  updateCollection$: Observable<DefaultCollection<any>>;
  updateValues$: Observable<any[]>;

  constructor(private db: SapphireDb, private userState: UserStateService) {}

  ngOnInit() {
    this.updateCollection$ = this.getCollection$('UpdateExamples');
    this.updateValues$ = this.getValues$(this.updateCollection$);
  }

  add(collection$: Observable<DefaultCollection<any>>) {
    collection$.pipe(take(1)).subscribe(collection => {
      collection.add({
        requiresUser: 'Yes',
        customFunction: 'Field requires User must match yes to make this field updatable',
        requiresAdmin: 'This field is only updatable by admins'
      });
    });
  }

  remove(collection$: Observable<DefaultCollection<any>>, value: any) {
    collection$.pipe(take(1)).subscribe(collection => {
      collection.remove(value);
    });
  }

  update(collection$: Observable<DefaultCollection<any>>, value: any) {
    collection$.pipe(take(1)).subscribe(collection => {
      collection.update({
        ...value,
        requiresUser: 'No',
        customFunction: 'test 123',
        requiresAdmin: 'Updated'
      });
    });
  }

  private getValues$(collection$: Observable<DefaultCollection<any>>): Observable<any[]> {
    return collection$.pipe(
      switchMap((collection) => {
        return collection.values().pipe(
          catchError((err) => {
            return of([err]);
          })
        );
      })
    );
  }

  private getCollection$(name: string): Observable<DefaultCollection<any>> {
    return this.userState.currentUser$.pipe(
      map(() => {
        return this.db.collection(`AuthDemo.${name}`);
      }),
      shareReplay()
    );
  }
}
