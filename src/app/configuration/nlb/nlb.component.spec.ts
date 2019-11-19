import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NlbComponent } from './nlb.component';

describe('NlbComponent', () => {
  let component: NlbComponent;
  let fixture: ComponentFixture<NlbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NlbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
