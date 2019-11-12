import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhereComponent } from './where.component';

describe('WhereComponent', () => {
  let component: WhereComponent;
  let fixture: ComponentFixture<WhereComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhereComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
