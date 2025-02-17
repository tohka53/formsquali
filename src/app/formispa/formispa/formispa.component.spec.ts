import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormispaComponent } from './formispa.component';

describe('FormispaComponent', () => {
  let component: FormispaComponent;
  let fixture: ComponentFixture<FormispaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormispaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormispaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
