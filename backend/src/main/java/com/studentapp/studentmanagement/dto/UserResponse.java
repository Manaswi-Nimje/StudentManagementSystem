package com.studentapp.studentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * What the admin "Users" screen is allowed to see about an account.
 *
 * Deliberately excludes the password field entirely — not even the BCrypt
 * hash is returned. A hash isn't a secret you can safely display either:
 * it's still the one thing an attacker would want if this endpoint or the
 * browser's memory were ever compromised, and it has zero legitimate use
 * in the UI. Never add `password` back to this DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
