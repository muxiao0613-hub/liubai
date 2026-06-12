package com.example.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * 业务异常基类，携带要返回给前端的 HTTP 状态码。
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
