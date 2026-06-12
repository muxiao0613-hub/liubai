package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "checkin_id", nullable = false)
    private Long checkinId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(columnDefinition = "MEDIUMTEXT", nullable = false)
    private String data;

    @Column(columnDefinition = "MEDIUMTEXT", nullable = false)
    private String thumbnail;

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}