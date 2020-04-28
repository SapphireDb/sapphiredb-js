import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map, shareReplay, switchMap} from 'rxjs/operators';

interface Milestone {
  todos?: Todo[];
  title: string;
  id?: number;
}

interface Todo {
  milestone?: Milestone;
  id?: number;
  title: string;
  html_url?: string;
  state: 'open'|'closed';
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.less']
})
export class TodoComponent implements OnInit {

  milestones$: Observable<Milestone[]>;

  constructor(private httpClient: HttpClient) {
    this.milestones$ = this.httpClient.get<Milestone[]>('https://api.github.com/repos/SapphireDb/SapphireDb/milestones').pipe(
      catchError(() => of([])),
      switchMap((milestones: Milestone[]) => {
        return this.httpClient.get<Todo[]>('https://api.github.com/repos/SapphireDb/SapphireDb/issues?labels=todo').pipe(
          catchError(() => of([])),
          map((todos: Todo[]) => {
            return milestones.map(milestone => ({
                id: milestone.id,
                title: milestone.title,
                todos: todos.filter(t => t.milestone.id === milestone.id).map(t => ({
                  id: t.id,
                  title: t.title,
                  html_url: t.html_url,
                  state: t.state
                } as Todo))
              } as Milestone));
          })
        );
      }),
      shareReplay()
    );
  }

  ngOnInit(): void {
  }

}
