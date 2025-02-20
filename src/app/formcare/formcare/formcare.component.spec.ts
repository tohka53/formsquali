import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormcareComponent } from './formcare.component';

describe('FormcareComponent', () => {
  let component: FormcareComponent;
  let fixture: ComponentFixture<FormcareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormcareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormcareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
