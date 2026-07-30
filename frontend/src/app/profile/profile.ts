import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Studentservice, Student } from '../studentservice';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  isDirectProfile = false;
  searchText = '';
  student: Student | null = null;

  loading = false;
  searched = false;
  notFound = false;
  error = false;

  constructor(
    private ser: Studentservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      this.student = null;
      this.searchText = '';
      this.notFound = false;
      this.error = false;
      this.searched = false;

      if (id) {
        this.isDirectProfile = true;
        this.loading = true;
        this.ser.getStudentById(Number(id)).subscribe({
          next: (student) => {
            this.student = student;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.notFound = true;
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        this.isDirectProfile = false;
      }

      this.cdr.markForCheck();
    });
  }

  searchStudent() {
    const term = this.searchText.trim();
    if (!term) return;

    this.loading = true;
    this.notFound = false;
    this.error = false;
    this.searched = true;
    this.student = null;

    const byId$ = /^\d+$/.test(term) ? this.ser.getStudentById(Number(term)) : null;

    if (byId$) {
      byId$.subscribe({
        next: (student) => {
          this.student = student;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notFound = true;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
      return;
    }

    this.ser.searchStudents(term, 0, 1).subscribe({
      next: (result) => {
        this.student = result.content[0] ?? null;
        this.notFound = !this.student;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  }

  gradeLetter(marks: number): string {
    if (marks >= 90) return 'A';
    if (marks >= 75) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  }

  goBack() {
    this.router.navigate(['/dashboard/students']);
  }
}