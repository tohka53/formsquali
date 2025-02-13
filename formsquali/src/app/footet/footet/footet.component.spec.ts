import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FootetComponent } from './footet.component';

describe('FootetComponent', () => {
  let component: FootetComponent;
  let fixture: ComponentFixture<FootetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FootetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FootetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
