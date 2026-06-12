package com.example.backend.dto;

import com.example.backend.entity.Checkin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckinResponse {
    private Long id;
    private Long cityId;
    private String name;
    private String category;
    private String date;
    private String notes;
    private Double lat;
    private Double lng;
    private List<PhotoResponse> photos;

    public static CheckinResponse from(Checkin c, List<PhotoResponse> photos) {
        return new CheckinResponse(
                c.getId(),
                c.getCityId(),
                c.getName(),
                c.getCategory() != null ? c.getCategory().name().toLowerCase() : null,
                c.getDate() != null ? c.getDate().toString() : null,
                c.getNotes(),
                c.getLat(),
                c.getLng(),
                photos
        );
    }
}
