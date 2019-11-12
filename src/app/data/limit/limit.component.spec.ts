import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitComponent } from './limit.component';

describe('LimitComponent', () => {
  let component: LimitComponent;
  let fixture: ComponentFixture<LimitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
