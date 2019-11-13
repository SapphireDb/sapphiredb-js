import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAttributesComponent } from './action-attributes.component';

describe('ActionAttributesComponent', () => {
  let component: ActionAttributesComponent;
  let fixture: ComponentFixture<ActionAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
