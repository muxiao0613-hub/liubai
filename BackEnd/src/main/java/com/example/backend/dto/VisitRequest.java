package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VisitRequest {
    private LocalDate visitDate;

    /** visited / lived / business */
    private String status;
}
