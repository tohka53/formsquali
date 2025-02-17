import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormscComponent } from './formsc.component';

describe('FormscComponent', () => {
  let component: FormscComponent;
  let fixture: ComponentFixture<FormscComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormscComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
