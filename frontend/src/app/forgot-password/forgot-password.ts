import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {

  // Two-step flow: 'identify' confirms the account, 'reset' sets the
  // new password. Kept as one component/route so the whole recovery
  // journey lives at a single, bookmarkable URL.
  step: 'identify' | 'reset' | 'done' = 'identify';

  username = '';
  email = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;

  submitting = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  submitIdentity() {
    if (!this.username.trim() || !this.email.trim()) {
      this.errorMessage = 'Enter both your username and the email on your account.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth.verifyIdentity({ username: this.username.trim(), email: this.email.trim() }).subscribe({
      next: () => {
        this.submitting = false;
        this.step = 'reset';
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.status === 404
          ? "We couldn't find an account matching that username and email."
          : 'Something went wrong. Please try again.';
      }
    });
  }

  submitReset() {
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Your new password needs to be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth.resetPassword({
      username: this.username.trim(),
      email: this.email.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.step = 'done';
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Could not reset your password. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
