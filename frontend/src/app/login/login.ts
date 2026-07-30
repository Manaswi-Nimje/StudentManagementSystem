import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';
  showPassword = false;

  submitting = false;
  errorMessage = '';

  private redirectTo = '/dashboard';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const qp = this.route.snapshot.queryParamMap.get('redirectTo');
    if (qp) this.redirectTo = qp;
  }

  submit() {
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Enter both your username and password.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        // Land straight on the student ledger, not the overview, so the
        // full list is visible immediately after signing in.
        this.router.navigateByUrl(this.redirectTo === '/dashboard' ? '/dashboard/students' : this.redirectTo);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.status === 401 || err.status === 403
          ? 'Incorrect username or password.'
          : 'Could not sign in. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}