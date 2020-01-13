import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FluentComponent } from './fluent.component';

describe('FluentComponent', () => {
  let component: FluentComponent;
  let fixture: ComponentFixture<FluentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FluentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FluentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
