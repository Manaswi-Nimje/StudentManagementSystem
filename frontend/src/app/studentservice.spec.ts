import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class StudentService {

  constructor(private http: HttpClient) {}

  getStudents() {

    return this.http.get<any[]>('assets/students.json');

  }

}
