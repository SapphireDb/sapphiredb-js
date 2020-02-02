import {Component, OnInit} from '@angular/core';
import {DefaultCollection} from 'sapphiredb';
import { SapphireDbService } from 'ng-sapphiredb';
import {UserStateService} from '../user-state.service';
import {Observable, of} from 'rxjs';
import {catchError, map, shareReplay, switchMap, take} from 'rxjs/operators';

@Component({
  selector: 'app-query-auth',
  templateUrl: './query-auth.component.html',
  styleUrls: ['./query-auth.component.less']
})
export class QueryAuthComponent implements OnInit {
  requiresAuthValuesCollection$: Observable<DefaultCollection<any>>;
  requiresAuthValues$: Observable<any[]>;

  requiresAdminValuesCollection$: Observable<DefaultCollection<any>>;
  requiresAdminValues$: Observable<any[]>;

  customFunctionValuesCollection$: Observable<DefaultCollection<any>>;
  customFunctionValues$: Observable<any[]>;

  customFunctionPerEntryValuesCollection$: Observable<DefaultCollection<any>>;
  customFunctionPerEntryValues$: Observable<any[]>;

  queryFieldsCollection$: Observable<DefaultCollection<any>>;
  queryFields$: Observable<any[]>;

  constructor(private db: SapphireDbService, private userState: UserStateService) {}

  ngOnInit() {
    this.requiresAuthValuesCollection$ = this.getCollection$('RequiresAuthForQueryDemos');
    this.requiresAuthValues$ = this.getValues$(this.requiresAuthValuesCollection$);

    this.requiresAdminValuesCollection$ = this.getCollection$('RequiresAdminForQueryDemos');
    this.requiresAdminValues$ = this.getValues$(this.requiresAdminValuesCollection$);

    this.customFunctionValuesCollection$ = this.getCollection$('CustomFunctionForQueryDemos');
    this.customFunctionValues$ = this.getValues$(this.customFunctionValuesCollection$);

    this.customFunctionPerEntryValuesCollection$ = this.getCollection$('CustomFunctionPerEntryForQueryDemos');
    this.customFunctionPerEntryValues$ = this.getValues$(this.customFunctionPerEntryValuesCollection$);

    this.queryFieldsCollection$ = this.getCollection$('QueryFieldDemos');
    this.queryFields$ = this.getValues$(this.queryFieldsCollection$);
  }

  add(collection$: Observable<DefaultCollection<any>>) {
    collection$.pipe(take(1)).subscribe(collection => {
      if (collection$ === this.customFunctionPerEntryValuesCollection$) {
        collection.add({
          content: 'Test 1'
        });
      } else {
        collection.add({
          content: 'This is a test value'
        });
      }

      if (collection$ === this.queryFieldsCollection$) {
        collection.add({
          content: 'Test 1',
          content2: 'Test 2',
          content3: 'Test 3'
        });
      }
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
        content: 'Updated content'
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
