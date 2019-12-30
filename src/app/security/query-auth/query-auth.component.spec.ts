import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryAuthComponent } from './query-auth.component';

describe('QueryAuthComponent', () => {
  let component: QueryAuthComponent;
  let fixture: ComponentFixture<QueryAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
