package com.studentapp.studentmanagement.service.impl;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.UserResponse;
import com.studentapp.studentmanagement.repository.UserRepository;
import com.studentapp.studentmanagement.service.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Same whitelist approach as StudentServiceImpl: the caller's sortBy
    // string is only ever used to look up a value here, never interpolated
    // directly, so this stays safe from SQL injection regardless of input.
    private static final Map<String, String> SORT_COLUMNS = Map.of(
            "id", "id",
            "fullName", "full_name",
            "username", "username",
            "email", "email",
            "role", "role",
            "createdAt", "created_at"
    );

    @Override
    @SuppressWarnings("unchecked")
    public PageResponse<UserResponse> getAllUsers(int page, int size, String sortBy, String direction) {
        String column = SORT_COLUMNS.getOrDefault(sortBy, "id");
        String dir = "desc".equalsIgnoreCase(direction) ? "DESC" : "ASC";

        int startRow = page * size;
        int endRow = startRow + size;

        // Deliberately select only the safe columns by name — the password
        // hash column is never part of this query, so there's no path for
        // it to leak into the response even if the DTO mapping below were
        // ever changed carelessly.
        String sql = "SELECT * FROM (" +
                "  SELECT u.*, ROWNUM rnum FROM (" +
                "    SELECT id, full_name, username, email, role, created_at " +
                "    FROM portal_users ORDER BY " + column + " " + dir +
                "  ) u WHERE ROWNUM <= :endRow" +
                ") WHERE rnum > :startRow";

        Query nativeQuery = entityManager.createNativeQuery(sql);
        nativeQuery.setParameter("startRow", startRow);
        nativeQuery.setParameter("endRow", endRow);

        List<Object[]> rows = nativeQuery.getResultList();
        List<UserResponse> content = rows.stream().map(this::mapRow).collect(Collectors.toList());

        long totalElements = userRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }

    private UserResponse mapRow(Object[] row) {
        return new UserResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                (String) row[3],
                (String) row[4],
                row[5] == null ? null : ((Timestamp) row[5]).toLocalDateTime()
        );
    }
}
