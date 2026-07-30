package com.studentapp.studentmanagement.controller;

import com.studentapp.studentmanagement.dto.AuthResponse;
import com.studentapp.studentmanagement.dto.ForgotPasswordRequest;
import com.studentapp.studentmanagement.dto.LoginRequest;
import com.studentapp.studentmanagement.dto.MessageResponse;
import com.studentapp.studentmanagement.dto.RegisterRequest;
import com.studentapp.studentmanagement.dto.ResetPasswordRequest;
import com.studentapp.studentmanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/forgot-password
    // Step 1 of the reset flow: confirms the username + email match a real
    // account before the client shows the "set a new password" screen.
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.verifyIdentity(request);
        return ResponseEntity.ok(new MessageResponse("Identity confirmed. You can set a new password now."));
    }

    // POST /api/auth/reset-password
    // Step 2: re-verifies identity and updates the password.
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Password updated. You can sign in now."));
    }
}
