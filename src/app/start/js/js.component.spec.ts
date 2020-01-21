import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsComponent } from './js.component';

describe('JsComponent', () => {
  let component: JsComponent;
  let fixture: ComponentFixture<JsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
