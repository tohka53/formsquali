import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormcpayComponent } from './formcpay.component';

describe('FormcpayComponent', () => {
  let component: FormcpayComponent;
  let fixture: ComponentFixture<FormcpayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormcpayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormcpayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
