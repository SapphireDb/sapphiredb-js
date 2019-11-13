import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionTypesComponent } from './connection-types.component';

describe('ConnectionTypesComponent', () => {
  let component: ConnectionTypesComponent;
  let fixture: ComponentFixture<ConnectionTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
