import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Student {
  id?: number;
  studName: string;
  course: string;
  marks: number;
  admissionDate: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface StudentStats {
  totalStudents: number;
  averageMarks: number;
  topPerformers: number;
  courseBreakdown: Record<string, number>;
  recent: Student[];
}

@Injectable({
  providedIn: 'root'
})
export class Studentservice {

  // Base URL comes from environment config, so dev/prod builds can point
  // at different backends without touching code.
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getStudents(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'asc'): Observable<PageResponse<Student>> {
    const url = `${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    return this.http.get<PageResponse<Student>>(url);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  addStudent(data: Student): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, data);
  }

  updateStudent(id: number, data: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, data);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchStudents(keyword: string, page: number = 0, size: number = 10): Observable<PageResponse<Student>> {
    const url = `${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    return this.http.get<PageResponse<Student>>(url);
  }

  // Backed by a single aggregate SQL query on the server instead of pulling
  // a large page of full student rows and reducing it in the browser -
  // much faster on every Overview page load, especially as the roster grows.
  getStats(): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.baseUrl}/stats`);
  }
}
