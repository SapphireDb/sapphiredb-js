import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecuteComponent } from './execute.component';

describe('ExecuteComponent', () => {
  let component: ExecuteComponent;
  let fixture: ComponentFixture<ExecuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
