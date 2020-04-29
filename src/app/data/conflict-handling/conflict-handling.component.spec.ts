import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictHandlingComponent } from './conflict-handling.component';

describe('ConflictHandlingComponent', () => {
  let component: ConflictHandlingComponent;
  let fixture: ComponentFixture<ConflictHandlingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConflictHandlingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
