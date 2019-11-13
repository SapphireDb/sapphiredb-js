import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionManagementComponent } from './connection-management.component';

describe('ConnectionManagementComponent', () => {
  let component: ConnectionManagementComponent;
  let fixture: ComponentFixture<ConnectionManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
