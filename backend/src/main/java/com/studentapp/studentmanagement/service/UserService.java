package com.studentapp.studentmanagement.service;

import com.studentapp.studentmanagement.dto.PageResponse;
import com.studentapp.studentmanagement.dto.UserResponse;

public interface UserService {
    PageResponse<UserResponse> getAllUsers(int page, int size, String sortBy, String direction);
}
