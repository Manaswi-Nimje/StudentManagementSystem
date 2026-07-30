package com.studentapp.studentmanagement.controller;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.StudentStatsResponse;
import com.studentapp.studentmanagement.entity.Student;
import com.studentapp.studentmanagement.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // POST /api/students
    @PostMapping
    public ResponseEntity<Student> addStudent(@Valid @RequestBody Student student) {
        Student saved = studentService.addStudent(student);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // GET /api/students?page=0&size=10&sortBy=id&direction=asc
    @GetMapping
    public ResponseEntity<PageResponse<Student>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        PageResponse<Student> students = studentService.getAllStudents(page, size, sortBy, direction);
        return ResponseEntity.ok(students);
    }

    // GET /api/students/5
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // PUT /api/students/5
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id,
                                                  @Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    // DELETE /api/students/5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/students/stats
    // Powers the Overview page: total count, average marks, top-performer
    // count, per-course breakdown, and the 5 most recent students - all
    // computed in one lightweight SQL round trip instead of the client
    // fetching up to 200 full student rows and reducing them in JS.
    @GetMapping("/stats")
    public ResponseEntity<StudentStatsResponse> getStats() {
        return ResponseEntity.ok(studentService.getStats());
    }

    // GET /api/students/search?keyword=cse&page=0&size=10
    @GetMapping("/search")
    public ResponseEntity<PageResponse<Student>> searchStudents(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(studentService.searchStudents(keyword, page, size));
    }
}
