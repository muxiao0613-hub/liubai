package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private String coverPhoto;
    private String notes;
    private String createdAt;
    private List<String> cityCodes;
}
