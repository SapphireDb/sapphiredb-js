import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelAttributesComponent } from './model-attributes.component';

describe('ModelAttributesComponent', () => {
  let component: ModelAttributesComponent;
  let fixture: ComponentFixture<ModelAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
