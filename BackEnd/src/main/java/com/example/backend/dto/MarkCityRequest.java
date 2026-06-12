package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MarkCityRequest {
    @NotBlank(message = "省份编码不能为空")
    private String provinceCode;

    @NotBlank(message = "城市编码不能为空")
    private String cityCode;

    @NotBlank(message = "城市名称不能为空")
    private String cityName;

    private LocalDate visitDate;

    /** visited / lived / business */
    private String status;
}
