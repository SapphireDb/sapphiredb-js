import {Component, ComponentRef, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.less']
})
export class DocComponent implements OnInit, OnChanges {
  @Input() showContent = true;

  languages: { lang: string, content: string, name: string, nameNormalized: string }[];
  @ViewChild('langElement', {static: true}) langElementRef: ElementRef;

  constructor() { }

  compileTemplate() {
    if (this.langElementRef.nativeElement.innerText) {
      this.languages = this.langElementRef.nativeElement.innerText
        .split('\\f:(')
        .filter(v => !!v.trim())
        .map(v => {
          const languageParts = ('\\f:(' + v).match(/\\f:\((.*?)\)/)[1].split(':');

          return {
            name: languageParts[1],
            lang: languageParts[0],
            nameNormalized: languageParts[1].split('.').join(''),
            content: v.substr(v.indexOf(')') + 1).split('\\n').map(l => {
              return l.trim().split('\\t').map(iv => iv.trim()).join('  ');
            }).join('\n')
          };
        });
    }
  }

  ngOnInit() {
    this.compileTemplate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.compileTemplate();
  }
}
