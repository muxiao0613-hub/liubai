package com.example.backend.controller;

import com.example.backend.dto.CheckinRequest;
import com.example.backend.dto.CheckinResponse;
import com.example.backend.security.SecurityUtils;
import com.example.backend.service.CheckinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<CheckinResponse>> getCheckinsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(checkinService.getCheckinsByCity(SecurityUtils.getCurrentUserId(), cityId));
    }

    @PostMapping
    public ResponseEntity<CheckinResponse> createCheckin(@Valid @RequestBody CheckinRequest request) {
        CheckinResponse created = checkinService.createCheckin(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CheckinResponse> updateCheckin(@PathVariable Long id, @RequestBody CheckinRequest request) {
        return ResponseEntity.ok(checkinService.updateCheckin(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckin(@PathVariable Long id) {
        checkinService.deleteCheckin(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
