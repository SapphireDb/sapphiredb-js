import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAuthComponent } from './update-auth.component';

describe('UpdateAuthComponent', () => {
  let component: UpdateAuthComponent;
  let fixture: ComponentFixture<UpdateAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
