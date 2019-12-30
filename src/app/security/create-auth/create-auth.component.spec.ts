import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAuthComponent } from './create-auth.component';

describe('CreateAuthComponent', () => {
  let component: CreateAuthComponent;
  let fixture: ComponentFixture<CreateAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
