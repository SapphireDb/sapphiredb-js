import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetCoreComponent } from './net-core.component';

describe('NetCoreComponent', () => {
  let component: NetCoreComponent;
  let fixture: ComponentFixture<NetCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
