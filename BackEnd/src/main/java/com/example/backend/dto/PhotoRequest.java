package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PhotoRequest {
    /** 仅在独立上传照片到已有打卡时需要 */
    private Long checkinId;
    private String data;
    private String thumbnail;
    private String originalName;
    private LocalDateTime takenAt;
    private String caption;
}
