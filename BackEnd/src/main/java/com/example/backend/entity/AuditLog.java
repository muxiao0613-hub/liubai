package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 操作者（管理员）id 与用户名快照。 */
    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_username", length = 50)
    private String actorUsername;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AuditAction action;

    /** 操作对象类型，目前固定为 USER，预留扩展。 */
    @Column(name = "target_type", length = 30)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    /** 对象的可读标签快照（如用户名），便于对象删除后仍可追溯。 */
    @Column(name = "target_label", length = 100)
    private String targetLabel;

    @Column(length = 500)
    private String detail;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AuditAction {
        CREATE_USER,
        UPDATE_USER,
        RESET_PASSWORD,
        DELETE_USER,
        ENABLE_USER,
        DISABLE_USER,
        CHANGE_PASSWORD
    }
}
