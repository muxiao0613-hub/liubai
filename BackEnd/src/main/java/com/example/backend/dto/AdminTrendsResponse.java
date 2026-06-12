package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** 仪表盘趋势统计。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminTrendsResponse {
    private List<DailyCount> registrations;  // 近 30 天每日注册数
    private long activeUsers7d;              // 近 7 天有登录的用户数
    private long activeUsers30d;             // 近 30 天有登录的用户数
    private long adminCount;
    private long userCount;
    private List<ProvinceCount> topProvinces; // 城市记录最多的省份 Top 10

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCount {
        private String date;   // yyyy-MM-dd
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvinceCount {
        private String provinceCode;
        private long count;
    }
}
