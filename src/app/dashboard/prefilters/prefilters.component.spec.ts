import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefiltersComponent } from './prefilters.component';

describe('PrefiltersComponent', () => {
  let component: PrefiltersComponent;
  let fixture: ComponentFixture<PrefiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrefiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
