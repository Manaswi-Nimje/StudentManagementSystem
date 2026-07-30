package com.studentapp.studentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Standard pagination wrapper we build ourselves.
 *
 * Why not use Spring Data's built-in Page<T>? Because Page<T> relies on
 * Hibernate generating "OFFSET ... FETCH NEXT ... ROWS ONLY" SQL, which only
 * works on Oracle 12c and above. Our Oracle 11g database needs classic
 * ROWNUM-based pagination instead, so we build the response manually here -
 * but keep the exact same JSON shape (content, totalElements, totalPages...)
 * so the Angular frontend doesn't need to care which style is used underneath.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
