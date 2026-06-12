package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.AuditLogResponse;
import com.example.backend.entity.AuditLog;
import com.example.backend.repository.AuditLogRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /** 记录一条管理操作。actorUsername 由 actorId 解析快照，对象删除后仍可追溯。 */
    @Transactional
    public void record(Long actorId, AuditLog.AuditAction action,
                       Long targetId, String targetLabel, String detail) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorUsername(resolveUsername(actorId));
        log.setAction(action);
        log.setTargetType("USER");
        log.setTargetId(targetId);
        log.setTargetLabel(targetLabel);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getLogs(int page, int size, String action) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        AuditLog.AuditAction filter = parseAction(action);
        Page<AuditLog> logs = (filter == null)
                ? auditLogRepository.findAll(pageable)
                : auditLogRepository.findByAction(filter, pageable);
        return PagedResponse.from(logs, AuditLogResponse::from);
    }

    private String resolveUsername(Long actorId) {
        if (actorId == null) return null;
        return userRepository.findById(actorId).map(u -> u.getUsername()).orElse(null);
    }

    private AuditLog.AuditAction parseAction(String action) {
        if (action == null || action.isBlank()) {
            return null; // 不筛选
        }
        try {
            return AuditLog.AuditAction.valueOf(action.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // 无效筛选值时按全部处理
        }
    }
}
