package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CityUpdateRequest {
    private String notes;
    private LocalDate firstVisit;
}
