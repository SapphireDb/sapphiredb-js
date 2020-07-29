import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerSideQueryComponent } from './server-side-query.component';

describe('ServerSideQueryComponent', () => {
  let component: ServerSideQueryComponent;
  let fixture: ComponentFixture<ServerSideQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerSideQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerSideQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
