import {Component, ComponentRef, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {SapphireOfflineEntity} from 'sapphiredb';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.less']
})
export class DocComponent implements OnInit, OnChanges {
  @Input() showContent = true;

  id = new SapphireOfflineEntity().id;
  contents: { lang: string, content: string, name: string, section?: string, nameNormalized: string }[][];
  @ViewChild('langElement', {static: true}) langElementRef: ElementRef;

  constructor() { }

  compileTemplate() {
    if (this.langElementRef.nativeElement.innerText) {
      this.contents = this.langElementRef.nativeElement.innerText
        .split('\\f:(')
        .filter(v => !!v.trim())
        .map(v => {
          const languageParts = ('\\f:(' + v).match(/\\f:\((.*?)\)/)[1].split(':');

          return {
            name: languageParts[1],
            lang: languageParts[0],
            section: languageParts[2],
            nameNormalized: languageParts[1].split('.').join('') + '_id' + new SapphireOfflineEntity().id,
            content: v.substr(v.indexOf(')') + 1).split('\\n').map(l => {
              return l.trim().split('\\t').map(iv => iv.trim()).join('  ');
            }).join('\n')
          };
        })
        .GroupBy(v => v.section);
    }
  }

  ngOnInit() {
    this.compileTemplate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.compileTemplate();
  }
}
