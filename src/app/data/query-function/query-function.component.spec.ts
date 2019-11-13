import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryFunctionComponent } from './query-function.component';

describe('QueryFunctionComponent', () => {
  let component: QueryFunctionComponent;
  let fixture: ComponentFixture<QueryFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryFunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
