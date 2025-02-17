import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormprodeComponent } from './formprode.component';

describe('FormprodeComponent', () => {
  let component: FormprodeComponent;
  let fixture: ComponentFixture<FormprodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormprodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormprodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
