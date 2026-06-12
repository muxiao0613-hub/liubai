package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** 管理员查看某用户全部足迹的聚合响应。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFootprintResponse {
    private UserResponse user;
    private List<CityResponse> cities;
    private List<TripResponse> trips;
}
