package com.example.backend.controller;

import com.example.backend.dto.CityResponse;
import com.example.backend.dto.CityUpdateRequest;
import com.example.backend.dto.MarkCityRequest;
import com.example.backend.dto.VisitRequest;
import com.example.backend.security.SecurityUtils;
import com.example.backend.service.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @GetMapping
    public ResponseEntity<List<CityResponse>> getCities() {
        return ResponseEntity.ok(cityService.getCitiesByUser(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityResponse> getCity(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCityResponse(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    public ResponseEntity<CityResponse> markCity(@Valid @RequestBody MarkCityRequest request) {
        CityResponse created = cityService.markCity(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/visits")
    public ResponseEntity<CityResponse> addVisit(@PathVariable Long id, @RequestBody VisitRequest request) {
        return ResponseEntity.ok(cityService.addVisit(SecurityUtils.getCurrentUserId(), id, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CityResponse> updateCity(@PathVariable Long id, @RequestBody CityUpdateRequest request) {
        return ResponseEntity.ok(cityService.updateCity(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable Long id) {
        cityService.deleteCity(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCities() {
        cityService.deleteAllForUser(SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
