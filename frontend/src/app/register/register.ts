import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  fullName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;

  submitting = false;
  errorMessage = '';
  fieldErrors: Record<string, string> = {};

  constructor(private auth: AuthService, private router: Router) {}

  get passwordsMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  }

  submit() {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (!this.fullName.trim() || !this.username.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Please fill in every field.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    if (this.passwordsMismatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.submitting = true;

    this.auth.register({
      fullName: this.fullName.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        // Straight to the ledger — visible immediately, no extra click.
        this.router.navigateByUrl('/dashboard/students');
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.errorMessage = err.error?.message ?? 'That username or email is already registered.';
        } else if (err.status === 400 && err.error?.fieldErrors) {
          this.fieldErrors = err.error.fieldErrors;
          this.errorMessage = 'Please fix the highlighted fields.';
        } else {
          this.errorMessage = 'Could not create your account. Please try again.';
        }
      }
    });
  }
}
