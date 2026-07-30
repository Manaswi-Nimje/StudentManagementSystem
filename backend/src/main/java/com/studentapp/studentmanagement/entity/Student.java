package com.studentapp.studentmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "students", indexes = {
        // The ledger's default view sorts/searches by these columns on
        // every page load — without indexes, each query does a full table
        // scan that gets slower as the roster grows. These keep list,
        // sort, and search queries fast regardless of table size.
        @Index(name = "idx_students_stud_name", columnList = "stud_name"),
        @Index(name = "idx_students_course", columnList = "course"),
        @Index(name = "idx_students_marks", columnList = "marks"),
        @Index(name = "idx_students_admission_date", columnList = "admission_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    // Oracle (especially 11g) doesn't support auto-increment IDENTITY columns
    // the way MySQL does, so we use a database SEQUENCE instead - Hibernate
    // will create this sequence automatically and pull the next value from it.
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "student_seq")
    @SequenceGenerator(name = "student_seq", sequenceName = "student_seq", allocationSize = 1)
    private Long id;

    @NotBlank(message = "Student name is required")
    @Column(nullable = false)
    private String studName;

    @NotBlank(message = "Course is required")
    @Column(nullable = false)
    private String course;

    @NotNull(message = "Marks is required")
    @DecimalMin(value = "0.0", message = "Marks cannot be negative")
    @DecimalMax(value = "100.0", message = "Marks cannot exceed 100")
    @Column(nullable = false)
    private Double marks;

    @NotNull(message = "Admission date is required")
    @Column(nullable = false)
    private LocalDate admissionDate;
}
