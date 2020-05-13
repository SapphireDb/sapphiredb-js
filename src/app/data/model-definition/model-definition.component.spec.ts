import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDefinitionComponent } from './model-definition.component';

describe('ModelDefinitionComponent', () => {
  let component: ModelDefinitionComponent;
  let fixture: ComponentFixture<ModelDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
