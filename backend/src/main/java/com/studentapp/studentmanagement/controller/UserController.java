package com.studentapp.studentmanagement.controller;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.UserResponse;
import com.studentapp.studentmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Account directory, visible to any signed-in staff member. Returns
 * username / email / full name / role / created-at for every account —
 * never the password (hashed or otherwise). See UserResponse for why that
 * field is excluded at the DTO level, not just filtered on the way out.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users?page=0&size=10&sortBy=createdAt&direction=desc
    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(userService.getAllUsers(page, size, sortBy, direction));
    }
}