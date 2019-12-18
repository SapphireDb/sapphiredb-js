import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncludeComponent } from './include.component';

describe('IncludeComponent', () => {
  let component: IncludeComponent;
  let fixture: ComponentFixture<IncludeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncludeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
