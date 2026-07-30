import { ComponentFixture, TestBed } from '@angular/core/testing';

import {StudentlistComponent} from './studentlist';

describe('Studentlist', () => {
  let component: StudentlistComponent;
  let fixture: ComponentFixture<StudentlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentlistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentlistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
