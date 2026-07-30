import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddstudentComponent} from './addstudent';

describe('Addstudent', () => {
  let component: AddstudentComponent;
  let fixture: ComponentFixture<AddstudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddstudentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddstudentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
