import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Studentservice } from '../studentservice';

@Component({
  selector: 'app-addstudent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './addstudent.html',
  styleUrls: ['./addstudent.css']
})
export class AddstudentComponent implements OnInit {

  editId: number | null = null;
  submitting = false;
  loadError = false;
  successMessage = '';

  studentForm = new FormGroup({
    studName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    course: new FormControl('', Validators.required),
    marks: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
    admissionDate: new FormControl('', Validators.required)
  });

  constructor(
    private ser: Studentservice,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.editId = Number(idParam);
    this.ser.getStudentById(this.editId).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          studName: student.studName,
          course: student.course,
          marks: student.marks,
          admissionDate: student.admissionDate
        });
      },
      error: () => {
        this.loadError = true;
      }
    });
  }

  get f() {
    return this.studentForm.controls;
  }

  submit() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.value;
    const payload = {
      studName: formValue.studName!.trim(),
      course: formValue.course!.trim(),
      marks: Number(formValue.marks),
      admissionDate: formValue.admissionDate!
    };

    this.submitting = true;

    const request$ = this.editId
      ? this.ser.updateStudent(this.editId, payload)
      : this.ser.addStudent(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = this.editId ? 'Student record updated.' : 'Student added to the ledger.';
        if (!this.editId) {
          this.studentForm.reset();
        }
        setTimeout(() => {
          this.router.navigateByUrl('/dashboard/students');
        }, 900);
      },
      error: () => {
        this.submitting = false;
        this.successMessage = '';
        alert(`Could not ${this.editId ? 'update' : 'add'} the student. Please check the details and try again.`);
      }
    });
  }
}
