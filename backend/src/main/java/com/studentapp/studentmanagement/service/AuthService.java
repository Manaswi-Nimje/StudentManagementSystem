package com.studentapp.studentmanagement.service;

import com.studentapp.studentmanagement.dto.AuthResponse;
import com.studentapp.studentmanagement.dto.ForgotPasswordRequest;
import com.studentapp.studentmanagement.dto.LoginRequest;
import com.studentapp.studentmanagement.dto.RegisterRequest;
import com.studentapp.studentmanagement.dto.ResetPasswordRequest;
import com.studentapp.studentmanagement.entity.Role;
import com.studentapp.studentmanagement.entity.User;
import com.studentapp.studentmanagement.exception.DuplicateResourceException;
import com.studentapp.studentmanagement.exception.ResourceNotFoundException;
import com.studentapp.studentmanagement.repository.UserRepository;
import com.studentapp.studentmanagement.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("That username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with that email already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STAFF);

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        return toAuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));

        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    // Step 1 of the "forgot password" flow: confirm the username + email
    // pair matches an existing account before letting the client move on
    // to the reset-password screen. No email is ever sent — this is an
    // identity check, not a token-based reset — which is enough for a
    // single-tenant registrar tool without a mail server to run.
    public void verifyIdentity(ForgotPasswordRequest request) {
        userRepository.findByUsernameAndEmailIgnoreCase(request.getUsername(), request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account matches that username and email combination."));
    }

    // Step 2: the identity was already confirmed on the client's previous
    // step, but we re-verify here too since this call changes state.
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByUsernameAndEmailIgnoreCase(request.getUsername(), request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account matches that username and email combination."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
