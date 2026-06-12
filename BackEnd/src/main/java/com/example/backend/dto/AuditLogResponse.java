package com.example.backend.dto;

import com.example.backend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long actorId;
    private String actorUsername;
    private String action;
    private String targetType;
    private Long targetId;
    private String targetLabel;
    private String detail;
    private String createdAt;

    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorId(),
                log.getActorUsername(),
                log.getAction() != null ? log.getAction().name() : null,
                log.getTargetType(),
                log.getTargetId(),
                log.getTargetLabel(),
                log.getDetail(),
                log.getCreatedAt() != null ? log.getCreatedAt().toString() : null
        );
    }
}
