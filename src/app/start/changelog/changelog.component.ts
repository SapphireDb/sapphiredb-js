import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.less']
})
export class ChangelogComponent implements OnInit {

  constructor(private httpClient: HttpClient) {

  }

  ngOnInit(): void {
  }

}
