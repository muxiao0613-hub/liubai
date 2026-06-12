package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.AuditLog;
import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.CityRepository;
import com.example.backend.repository.PhotoRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final CheckinRepository checkinRepository;
    private final PhotoRepository photoRepository;
    private final PasswordEncoder passwordEncoder;
    private final CityService cityService;
    private final TripService tripService;
    private final AuditLogService auditLogService;

    /** 用户列表排序白名单，防止任意字段排序注入。 */
    private static final Set<String> SORTABLE = Set.of("username", "createdAt", "lastLoginAt", "role");

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(int page, int size, String q, String sort, String order) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sort, order));
        Page<User> users = (q == null || q.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.findByUsernameContainingIgnoreCase(q.trim(), pageable);
        return PagedResponse.from(users, this::withStats);
    }

    private Sort buildSort(String sort, String order) {
        String prop = (sort != null && SORTABLE.contains(sort)) ? sort : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, prop);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        return withStats(findUser(userId));
    }

    /** 管理员查看某用户的全部足迹（城市/打卡/照片/行程）。 */
    @Transactional(readOnly = true)
    public UserFootprintResponse getUserFootprint(Long userId) {
        UserResponse user = withStats(findUser(userId));
        return new UserFootprintResponse(
                user,
                cityService.getCitiesByUser(userId),
                tripService.getTripsByUser(userId)
        );
    }

    @Transactional
    public UserResponse createUser(Long currentAdminId, UserCreateRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BadRequestException("用户名已存在");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(parseRole(req.getRole()));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        auditLogService.record(currentAdminId, AuditLog.AuditAction.CREATE_USER,
                saved.getId(), saved.getUsername(), "角色 " + saved.getRole());
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateUser(Long currentAdminId, Long userId, UserUpdateRequest req) {
        User user = findUser(userId);
        List<String> changes = new ArrayList<>();

        if (req.getUsername() != null && !req.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(req.getUsername())) {
                throw new BadRequestException("用户名已存在");
            }
            changes.add("用户名 " + user.getUsername() + " → " + req.getUsername());
            user.setUsername(req.getUsername());
        }

        if (req.getRole() != null) {
            User.UserRole newRole = parseRole(req.getRole());
            if (user.getRole() == User.UserRole.ADMIN && newRole != User.UserRole.ADMIN) {
                if (userId.equals(currentAdminId)) {
                    throw new BadRequestException("不能降级当前登录的管理员账号");
                }
                ensureNotLastAdmin();
            }
            if (newRole != user.getRole()) {
                changes.add("角色 " + user.getRole() + " → " + newRole);
            }
            user.setRole(newRole);
        }

        boolean enabledChanged = false;
        if (req.getEnabled() != null && !req.getEnabled()) {
            if (userId.equals(currentAdminId)) {
                throw new BadRequestException("不能禁用当前登录的管理员账号");
            }
            if (user.getRole() == User.UserRole.ADMIN) {
                ensureNotLastAdmin();
            }
            enabledChanged = Boolean.TRUE.equals(user.getEnabled());
            user.setEnabled(false);
        } else if (req.getEnabled() != null) {
            enabledChanged = !Boolean.TRUE.equals(user.getEnabled());
            user.setEnabled(true);
        }

        User saved = userRepository.save(user);

        // 仅切换启用状态时单独记一条更直观的审计；否则记一条字段变更。
        if (enabledChanged && changes.isEmpty()) {
            boolean nowEnabled = Boolean.TRUE.equals(saved.getEnabled());
            auditLogService.record(currentAdminId,
                    nowEnabled ? AuditLog.AuditAction.ENABLE_USER : AuditLog.AuditAction.DISABLE_USER,
                    saved.getId(), saved.getUsername(), null);
        } else if (!changes.isEmpty() || enabledChanged) {
            if (enabledChanged) {
                changes.add("状态 → " + (Boolean.TRUE.equals(saved.getEnabled()) ? "启用" : "禁用"));
            }
            auditLogService.record(currentAdminId, AuditLog.AuditAction.UPDATE_USER,
                    saved.getId(), saved.getUsername(), String.join("；", changes));
        }

        return UserResponse.from(saved);
    }

    @Transactional
    public void resetPassword(Long currentAdminId, Long userId, PasswordResetRequest req) {
        User user = findUser(userId);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
        auditLogService.record(currentAdminId, AuditLog.AuditAction.RESET_PASSWORD,
                user.getId(), user.getUsername(), null);
    }

    @Transactional
    public void deleteUser(Long currentAdminId, Long userId) {
        User user = findUser(userId);
        if (userId.equals(currentAdminId)) {
            throw new BadRequestException("不能删除当前登录的管理员账号");
        }
        if (user.getRole() == User.UserRole.ADMIN) {
            ensureNotLastAdmin();
        }
        // 先记审计（用户名快照），再级联删除该用户的全部业务数据
        auditLogService.record(currentAdminId, AuditLog.AuditAction.DELETE_USER,
                user.getId(), user.getUsername(), "角色 " + user.getRole());
        cityService.deleteAllForUser(userId);
        tripService.deleteAllForUser(userId);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                userRepository.count(),
                userRepository.countByRole(User.UserRole.ADMIN),
                userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7)),
                cityRepository.count(),
                checkinRepository.count(),
                photoRepository.count()
        );
    }

    @Transactional(readOnly = true)
    public AdminTrendsResponse getTrends() {
        LocalDateTime now = LocalDateTime.now();

        // 近 30 天每日注册数：取出后在内存分桶，补齐空缺日期为 0
        Map<LocalDate, Long> byDay = userRepository.findByCreatedAtAfter(now.minusDays(30)).stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDate(), Collectors.counting()));
        List<AdminTrendsResponse.DailyCount> registrations = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            registrations.add(new AdminTrendsResponse.DailyCount(d.toString(), byDay.getOrDefault(d, 0L)));
        }

        long adminCount = userRepository.countByRole(User.UserRole.ADMIN);
        long userCount = userRepository.count() - adminCount;

        List<AdminTrendsResponse.ProvinceCount> topProvinces = cityRepository.countGroupByProvince().stream()
                .limit(10)
                .map(r -> new AdminTrendsResponse.ProvinceCount((String) r[0], ((Number) r[1]).longValue()))
                .toList();

        return new AdminTrendsResponse(
                registrations,
                userRepository.countByLastLoginAtAfter(now.minusDays(7)),
                userRepository.countByLastLoginAtAfter(now.minusDays(30)),
                adminCount,
                userCount,
                topProvinces
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(int page, int size, String action) {
        return auditLogService.getLogs(page, size, action);
    }

    // ---- helpers ----

    private void ensureNotLastAdmin() {
        if (userRepository.countByRole(User.UserRole.ADMIN) <= 1) {
            throw new BadRequestException("系统必须保留至少一个管理员");
        }
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
    }

    private UserResponse withStats(User user) {
        return UserResponse.from(user).withStats(
                cityRepository.countByUserId(user.getId()),
                checkinRepository.countByUserId(user.getId()),
                photoRepository.countByUserId(user.getId())
        );
    }

    private User.UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            return User.UserRole.USER;
        }
        try {
            return User.UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("无效的角色: " + role);
        }
    }
}
