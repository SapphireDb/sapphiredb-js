import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PixelsComponent } from './pixels.component';

describe('PixelsComponent', () => {
  let component: PixelsComponent;
  let fixture: ComponentFixture<PixelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PixelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PixelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
