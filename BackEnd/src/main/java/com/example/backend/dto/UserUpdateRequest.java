package com.example.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(min = 2, max = 50, message = "用户名长度需在 2-50 个字符之间")
    private String username;

    /** ADMIN / USER */
    private String role;

    private Boolean enabled;
}
