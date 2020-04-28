import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, shareReplay} from 'rxjs/operators';

interface ReleaseEntry {
  tag_name: string;
  published_at: Date;
  body: string;
}

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.less']
})
export class ChangelogComponent implements OnInit {

  releases$: Observable<ReleaseEntry[]>;

  constructor(private httpClient: HttpClient) {
    this.releases$ = this.httpClient.get<ReleaseEntry[]>('https://api.github.com/repos/SapphireDb/SapphireDb/releases').pipe(
      catchError(() => of([])),
      shareReplay()
    );
  }

  ngOnInit(): void {
  }

}
