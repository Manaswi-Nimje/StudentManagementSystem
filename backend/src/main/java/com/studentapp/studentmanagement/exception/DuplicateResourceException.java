package com.studentapp.studentmanagement.exception;

// Thrown when a registration attempt reuses a username/email that's already taken.
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
