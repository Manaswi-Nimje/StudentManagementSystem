package com.studentapp.studentmanagement.dto;

import com.studentapp.studentmanagement.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Pre-aggregated numbers for the Overview page. Computed in SQL (COUNT/AVG/
 * GROUP BY) rather than by pulling hundreds of student rows to the browser
 * and reducing them in JS on every visit - the old approach got slower as
 * the roster grew and silently capped out at 200 rows. This scales to any
 * roster size with one lightweight query.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsResponse {
    private long totalStudents;
    private double averageMarks;
    private long topPerformers; // marks >= 85
    private Map<String, Long> courseBreakdown;
    private List<Student> recent; // most recently added, small fixed page
}
