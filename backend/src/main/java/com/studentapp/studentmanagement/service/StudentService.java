package com.studentapp.studentmanagement.service;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.StudentStatsResponse;
import com.studentapp.studentmanagement.entity.Student;

public interface StudentService {

    Student addStudent(Student student);

    PageResponse<Student> getAllStudents(int page, int size, String sortBy, String direction);

    Student getStudentById(Long id);

    Student updateStudent(Long id, Student student);

    void deleteStudent(Long id);

    PageResponse<Student> searchStudents(String keyword, int page, int size);

    StudentStatsResponse getStats();
}
