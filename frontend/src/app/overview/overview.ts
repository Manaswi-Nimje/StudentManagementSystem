import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Studentservice, Student } from '../studentservice';

interface CourseSlice {
  course: string;
  count: number;
  pct: number;
  color: string;
  dashOffset: number;
  dashLength: number;
}

const SLICE_COLORS = ['#1F6F54', '#B8863B', '#2E4266', '#A63446', '#5E8B7E', '#8890A0'];

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
  // OnPush is safe here: every field this template reads only ever changes
  // inside the getStats() subscription below, so Angular doesn't need to
  // re-check this component on every unrelated event in the app (typing in
  // a form elsewhere, a timer tick, etc.) - fewer change-detection passes,
  // snappier UI under load.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {

  loading = true;
  error = false;

  totalStudents = 0;
  averageMarks = 0;
  topPerformers = 0; // marks >= 85
  courseSlices: CourseSlice[] = [];
  recent: Student[] = [];
  readonly circumference = 2 * Math.PI * 42;

  constructor(private service: Studentservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // One lightweight aggregate request instead of pulling up to 200 full
    // student rows and reducing them in the browser - the server does the
    // COUNT/AVG/GROUP BY, so this stays fast and accurate at any roster size.
    this.service.getStats().subscribe({
      next: (stats) => {
        this.totalStudents = stats.totalStudents;
        this.averageMarks = stats.averageMarks;
        this.topPerformers = stats.topPerformers;
        this.recent = stats.recent;
        this.loading = false;

        const entries = Object.entries(stats.courseBreakdown);
        const total = entries.reduce((sum, [, count]) => sum + count, 0);
        let offset = 0;
        this.courseSlices = entries.map(([course, count], i) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          const length = total ? (count / total) * this.circumference : 0;
          const slice: CourseSlice = {
            course,
            count,
            pct,
            color: SLICE_COLORS[i % SLICE_COLORS.length],
            dashOffset: -offset,
            dashLength: length,
          };
          offset += length;
          return slice;
        });

        // This app runs zoneless (no zone.js), so Angular has no automatic
        // way of knowing this HTTP callback changed component state. With
        // OnPush, the view is only re-checked when explicitly told to -
        // this line is what actually makes "Loading the ledger..." go away.
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
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

  trackByCourse(_index: number, slice: CourseSlice): string {
    return slice.course;
  }

  trackByStudent(_index: number, student: Student): number | undefined {
    return student.id;
  }
}