import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DocComponent} from './shared/doc/doc.component';
import {NgMetro4Module} from 'ng-metro4';
import {HighlightModule} from 'ngx-highlightjs';
import {MarkdownModule} from 'ngx-markdown';
import {SanitizeHtmlPipe} from './shared/pipes/sanitize-html.pipe';



@NgModule({
  declarations: [
    DocComponent,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule,
    NgMetro4Module,
    HighlightModule,
    MarkdownModule
  ],
  exports: [
    DocComponent,
    SanitizeHtmlPipe,
    NgMetro4Module,
    HighlightModule,
    MarkdownModule
  ]
})
export class SharedModule { }
