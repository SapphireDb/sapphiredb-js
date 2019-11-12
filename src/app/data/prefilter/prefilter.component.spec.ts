import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefilterComponent } from './prefilter.component';

describe('PrefilterComponent', () => {
  let component: PrefilterComponent;
  let fixture: ComponentFixture<PrefilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrefilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
