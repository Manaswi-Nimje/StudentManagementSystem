import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

const TITLES: Record<string, string> = {
  overview: 'Overview',
  students: 'Student list',
  'add-student': 'Add student',
  users: 'Accounts',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  pageTitle = signal('Student list');

  userName = computed(() => this.auth.currentUser()?.fullName ?? 'Staff member');
  userEmail = computed(() => this.auth.currentUser()?.email ?? '');
  userRole = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Staff';
  });
  userInitial = computed(() => this.userName().trim().charAt(0).toUpperCase() || 'S');
  isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  constructor(private router: Router, private auth: AuthService) {
    this.updateTitle(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateTitle(e.urlAfterRedirects));
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private updateTitle(url: string) {
    const segment = url.split('/').pop() ?? '';
    this.pageTitle.set(TITLES[segment] ?? 'Student list');
  }
}
