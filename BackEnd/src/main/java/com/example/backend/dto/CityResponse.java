package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityResponse {
    private Long id;
    private String provinceCode;
    private String cityCode;
    private String cityName;
    private String firstVisit;
    private String notes;
    private List<String> visitedAt;
    private List<String> statuses;
    private List<CheckinResponse> checkins;
}
