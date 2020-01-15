import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackblitzStarterComponent } from './stackblitz-starter.component';

describe('StackblitzStarterComponent', () => {
  let component: StackblitzStarterComponent;
  let fixture: ComponentFixture<StackblitzStarterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackblitzStarterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackblitzStarterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
