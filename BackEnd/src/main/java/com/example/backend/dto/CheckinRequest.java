package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CheckinRequest {
    private Long cityId;

    @NotNull(message = "打卡名称不能为空")
    private String name;

    /** scenic / food / hotel / other */
    private String category;

    private LocalDate date;
    private String notes;
    private Double lat;
    private Double lng;

    /** 创建打卡时一并提交的照片 */
    private List<PhotoRequest> photos;
}
