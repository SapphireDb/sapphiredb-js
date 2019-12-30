import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveAuthComponent } from './remove-auth.component';

describe('RemoveAuthComponent', () => {
  let component: RemoveAuthComponent;
  let fixture: ComponentFixture<RemoveAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
