package io.systemdesign.lab.infrastructure.web.dto;

import java.time.Instant;

/** Uniform error body returned by the global exception handler. */
public record ApiError(int status, String error, String message, String path, Instant timestamp) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, Instant.now());
    }
}
