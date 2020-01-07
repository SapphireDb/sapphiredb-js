import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelValidationComponent } from './model-validation.component';

describe('ModelValidationComponent', () => {
  let component: ModelValidationComponent;
  let fixture: ComponentFixture<ModelValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
