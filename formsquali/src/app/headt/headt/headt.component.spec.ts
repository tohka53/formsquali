import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadtComponent } from './headt.component';

describe('HeadtComponent', () => {
  let component: HeadtComponent;
  let fixture: ComponentFixture<HeadtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeadtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
