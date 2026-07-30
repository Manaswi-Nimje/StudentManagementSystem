import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Userservice, AccountRecord } from '../userservice';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {

  accounts: AccountRecord[] = [];
  totalAccounts = 0;
  totalPages = 0;
  page = 0;
  pageSize = 10;

  sortBy = 'createdAt';
  direction: 'asc' | 'desc' = 'desc';

  loading = true;
  error = false;
  forbidden = false;

  readonly skeletonRows = Array.from({ length: 6 });

  constructor(private service: Userservice, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.error = false;
    this.forbidden = false;

    this.service.getUsers(this.page, this.pageSize, this.sortBy, this.direction).subscribe({
      next: (data) => {
        this.accounts = data.content;
        this.totalAccounts = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        // 403 means the signed-in account isn't an admin - a different,
        // more accurate message than a generic connection error.
        this.forbidden = err?.status === 403;
        this.error = !this.forbidden;
        this.cdr.markForCheck();
      }
    });
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadAccounts();
  }

  goToPage(delta: number) {
    const next = this.page + delta;
    if (next < 0 || next >= this.totalPages) return;
    this.page = next;
    this.loadAccounts();
  }

  roleLabel(role: string): string {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  trackByAccountId(_index: number, account: AccountRecord): number {
    return account.id;
  }
}
