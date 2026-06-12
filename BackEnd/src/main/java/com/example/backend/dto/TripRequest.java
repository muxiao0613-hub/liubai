package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class TripRequest {
    @NotBlank(message = "行程名称不能为空")
    private String name;

    /** ISO 日期字符串，可为空 */
    private String startDate;
    private String endDate;
    private String coverPhoto;
    private String notes;
    private List<String> cityCodes;
}
