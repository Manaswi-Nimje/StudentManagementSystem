package com.studentapp.studentmanagement.service.impl;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.StudentStatsResponse;
import com.studentapp.studentmanagement.entity.Student;
import com.studentapp.studentmanagement.exception.ResourceNotFoundException;
import com.studentapp.studentmanagement.repository.StudentRepository;
import com.studentapp.studentmanagement.service.StudentService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor // Lombok generates a constructor for the final field -> constructor injection
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Whitelist mapping request field names -> actual DB column names.
    // We NEVER interpolate the user's raw sortBy string into SQL directly -
    // it always has to match a key in this map first. This is what keeps the
    // native ROWNUM query below safe from SQL injection.
    private static final Map<String, String> SORT_COLUMNS = Map.of(
            "id", "id",
            "studName", "stud_name",
            "course", "course",
            "marks", "marks",
            "admissionDate", "admission_date"
    );

    @Override
    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    @Override
    @SuppressWarnings("unchecked")
    public PageResponse<Student> getAllStudents(int page, int size, String sortBy, String direction) {
        String column = SORT_COLUMNS.getOrDefault(sortBy, "id");
        String dir = "desc".equalsIgnoreCase(direction) ? "DESC" : "ASC";

        int startRow = page * size;
        int endRow = startRow + size;

        // Classic Oracle "top-N-rows" ROWNUM pagination pattern - works on
        // every Oracle version, including 11g (unlike OFFSET/FETCH which
        // needs 12c+).
        String sql = "SELECT * FROM (" +
                "  SELECT s.*, ROWNUM rnum FROM (" +
                "    SELECT * FROM students ORDER BY " + column + " " + dir +
                "  ) s WHERE ROWNUM <= :endRow" +
                ") WHERE rnum > :startRow";

        Query nativeQuery = entityManager.createNativeQuery(sql, Student.class);
        nativeQuery.setParameter("startRow", startRow);
        nativeQuery.setParameter("endRow", endRow);

        List<Student> content = nativeQuery.getResultList();
        long totalElements = studentRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Override
    public Student updateStudent(Long id, Student updatedStudent) {
        Student existing = getStudentById(id); // reuses the not-found check above

        existing.setStudName(updatedStudent.getStudName());
        existing.setCourse(updatedStudent.getCourse());
        existing.setMarks(updatedStudent.getMarks());
        existing.setAdmissionDate(updatedStudent.getAdmissionDate());

        return studentRepository.save(existing);
    }

    @Override
    public void deleteStudent(Long id) {
        Student existing = getStudentById(id);
        studentRepository.delete(existing);
    }

    @Override
    public PageResponse<Student> searchStudents(String keyword, int page, int size) {
        int startRow = page * size;
        int endRow = startRow + size;

        List<Student> content = studentRepository.searchPaginated(keyword, startRow, endRow);
        long totalElements = studentRepository.countSearchResults(keyword);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }

    @Override
    public StudentStatsResponse getStats() {
        long total = studentRepository.count();
        double avgMarks = Math.round(studentRepository.findAverageMarks() * 10) / 10.0;
        long topPerformers = studentRepository.countTopPerformers();

        Map<String, Long> courseBreakdown = new LinkedHashMap<>();
        for (Object[] row : studentRepository.findCourseBreakdown()) {
            courseBreakdown.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<Student> recent = studentRepository.findRecent(5);

        return new StudentStatsResponse(total, avgMarks, topPerformers, courseBreakdown, recent);
    }
}
