import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassTransformerComponent } from './class-transformer.component';

describe('ClassTransformerComponent', () => {
  let component: ClassTransformerComponent;
  let fixture: ComponentFixture<ClassTransformerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassTransformerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassTransformerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
