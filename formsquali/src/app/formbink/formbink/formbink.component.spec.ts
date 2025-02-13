import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormbinkComponent } from './formbink.component';

describe('FormbinkComponent', () => {
  let component: FormbinkComponent;
  let fixture: ComponentFixture<FormbinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormbinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormbinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
