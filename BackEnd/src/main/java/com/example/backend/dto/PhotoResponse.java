package com.example.backend.dto;

import com.example.backend.entity.Photo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
    private Long id;
    private Long checkinId;
    private String data;
    private String thumbnail;
    private String originalName;
    private String takenAt;
    private String caption;

    public static PhotoResponse from(Photo p) {
        return new PhotoResponse(
                p.getId(),
                p.getCheckinId(),
                p.getData(),
                p.getThumbnail(),
                p.getOriginalName(),
                p.getTakenAt() != null ? p.getTakenAt().toString() : null,
                p.getCaption()
        );
    }
}
