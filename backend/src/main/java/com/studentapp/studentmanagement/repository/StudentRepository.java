package com.studentapp.studentmanagement.repository;

import com.studentapp.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /*
     * Oracle 11g doesn't support the modern OFFSET/FETCH pagination syntax
     * that Spring Data's Pageable normally generates (that needs Oracle 12c+),
     * so plain listing pagination is done manually in the service layer via
     * EntityManager instead (see StudentServiceImpl). This repository only
     * holds the search query, which has a fixed ORDER BY so it's safe here.
     */

    @Query(value = "SELECT * FROM (" +
            "  SELECT s.*, ROWNUM rnum FROM (" +
            "    SELECT * FROM students " +
            "    WHERE UPPER(stud_name) LIKE UPPER('%' || :keyword || '%') " +
            "       OR UPPER(course) LIKE UPPER('%' || :keyword || '%') " +
            "    ORDER BY id" +
            "  ) s WHERE ROWNUM <= :endRow" +
            ") WHERE rnum > :startRow", nativeQuery = true)
    List<Student> searchPaginated(@Param("keyword") String keyword,
                                   @Param("startRow") int startRow,
                                   @Param("endRow") int endRow);

    @Query(value = "SELECT COUNT(*) FROM students " +
            "WHERE UPPER(stud_name) LIKE UPPER('%' || :keyword || '%') " +
            "   OR UPPER(course) LIKE UPPER('%' || :keyword || '%')", nativeQuery = true)
    long countSearchResults(@Param("keyword") String keyword);

    // ---- Overview page aggregates ----
    // Each of these does the reduction in the database instead of shipping
    // the whole roster to the client and reducing it in JS, so the Overview
    // page stays fast (and correct) no matter how large the roster gets.

    @Query(value = "SELECT NVL(AVG(marks), 0) FROM students", nativeQuery = true)
    double findAverageMarks();

    @Query(value = "SELECT COUNT(*) FROM students WHERE marks >= 85", nativeQuery = true)
    long countTopPerformers();

    @Query(value = "SELECT course, COUNT(*) AS cnt FROM students GROUP BY course ORDER BY cnt DESC",
            nativeQuery = true)
    List<Object[]> findCourseBreakdown();

    @Query(value = "SELECT * FROM (SELECT * FROM students ORDER BY id DESC) WHERE ROWNUM <= :limit",
            nativeQuery = true)
    List<Student> findRecent(@Param("limit") int limit);
}
