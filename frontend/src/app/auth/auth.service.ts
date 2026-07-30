import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  username: string;
  email: string;
}

export interface ResetPasswordPayload {
  username: string;
  email: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

const TOKEN_KEY = 'gradebook_token';
const USER_KEY = 'gradebook_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.authUrl;

  // Signal so the navbar/dashboard can react instantly to login/logout
  // without needing a page reload.
  currentUser = signal<AuthUser | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  // Step 1 of the reset flow: confirms username + email match an account.
  verifyIdentity(payload: ForgotPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  // Step 2: sets the new password once identity has been confirmed.
  resetPassword(payload: ResetPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, payload);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private persistSession(res: AuthResponse): void {
    const { token, ...user } = res;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
