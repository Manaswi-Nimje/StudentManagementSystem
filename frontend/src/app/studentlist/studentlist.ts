import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Studentservice, Student } from '../studentservice';

@Component({
  selector: 'app-studentlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './studentlist.html',
  styleUrls: ['./studentlist.css'],
  // OnPush skips re-checking this component on every unrelated app event
  // (route changes elsewhere, other components' timers, etc.) - it only
  // re-renders when its own inputs change or when we explicitly tell it to
  // below, right after new data actually arrives from the API.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentlistComponent implements OnInit {

  students: Student[] = [];
  totalStudents = 0;
  totalPages = 0;
  page = 0;
  pageSize = 8;

  searchTerm = '';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  loading = true;
  error = false;

  sortBy = 'id';
  direction: 'asc' | 'desc' = 'asc';

  // Just a fixed-length array to repeat skeleton rows over - not real data.
  readonly skeletonRows = Array.from({ length: 6 });

  toastMessage = '';
  private toastTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private service: Studentservice,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.error = false;

    const request$ = this.searchTerm.trim()
      ? this.service.searchStudents(this.searchTerm.trim(), this.page, this.pageSize)
      : this.service.getStudents(this.page, this.pageSize, this.sortBy, this.direction);

    request$.subscribe({
      next: (data) => {
        this.students = data.content;
        this.totalStudents = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      }
    });
  }

  trackByStudentId(_index: number, student: Student): number | undefined {
    return student.id;
  }

  onSearchChange() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.page = 0;
      this.loadStudents();
    }, 350);
  }

  clearSearch() {
    this.searchTerm = '';
    this.page = 0;
    this.loadStudents();
  }

  toggleSort(column: string) {
    if (this.searchTerm.trim()) return; // sorting only applies to the unfiltered list
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadStudents();
  }

  goToPage(delta: number) {
    const next = this.page + delta;
    if (next < 0 || next >= this.totalPages) return;
    this.page = next;
    this.loadStudents();
  }

  viewProfile(id: number | undefined) {
    if (id == null) return;
    this.router.navigateByUrl('/profile/' + id);
  }

  editStudent(id: number | undefined) {
    if (id == null) return;
    this.router.navigateByUrl('/dashboard/edit-student/' + id);
  }

  deleteStudent(id: number) {
    const confirmed = confirm('Remove this student from the ledger? This cannot be undone.');
    if (!confirmed) return;

    this.service.deleteStudent(id).subscribe({
      next: () => {
        this.showToast('Student removed.');
        if (this.students.length === 1 && this.page > 0) {
          this.page -= 1;
        }
        this.loadStudents();
      },
      error: () => {
        this.showToast('Could not remove student. Try again.');
      }
    });
  }

  gradeLetter(marks: number): string {
    if (marks >= 90) return 'A';
    if (marks >= 75) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.cdr.markForCheck();
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.markForCheck();
    }, 3000);
  }
}
