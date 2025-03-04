import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormempComponent } from './formemp.component';

describe('FormempComponent', () => {
  let component: FormempComponent;
  let fixture: ComponentFixture<FormempComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormempComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
