import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PageResponse } from './studentservice';

// Mirrors the backend's UserResponse DTO exactly — deliberately has no
// password field. The API never sends one, so there's nothing here to
// accidentally render even by mistake.
export interface AccountRecord {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class Userservice {

  private baseUrl = `${environment.apiBase}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page = 0, size = 10, sortBy = 'createdAt', direction = 'desc'): Observable<PageResponse<AccountRecord>> {
    const url = `${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    return this.http.get<PageResponse<AccountRecord>>(url);
  }
}
