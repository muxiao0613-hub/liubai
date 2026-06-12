package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long adminCount;
    private long newUsers7d;
    private long totalCities;
    private long totalCheckins;
    private long totalPhotos;
}
