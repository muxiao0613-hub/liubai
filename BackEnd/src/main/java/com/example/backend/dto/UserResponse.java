package com.example.backend.dto;

import com.example.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String role;
    private Boolean enabled;
    private String createdAt;
    private String updatedAt;
    private String lastLoginAt;
    // 可选的数据统计（管理面板用）
    private Long cityCount;
    private Long checkinCount;
    private Long photoCount;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.username = u.getUsername();
        r.role = u.getRole() != null ? u.getRole().name() : null;
        r.enabled = u.getEnabled();
        r.createdAt = u.getCreatedAt() != null ? u.getCreatedAt().toString() : null;
        r.updatedAt = u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null;
        r.lastLoginAt = u.getLastLoginAt() != null ? u.getLastLoginAt().toString() : null;
        return r;
    }

    public UserResponse withStats(long cityCount, long checkinCount, long photoCount) {
        this.cityCount = cityCount;
        this.checkinCount = checkinCount;
        this.photoCount = photoCount;
        return this;
    }
}
