package com.example.backend.controller;

import com.example.backend.dto.PhotoRequest;
import com.example.backend.dto.PhotoResponse;
import com.example.backend.security.SecurityUtils;
import com.example.backend.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping("/checkin/{checkinId}")
    public ResponseEntity<List<PhotoResponse>> getPhotosByCheckin(@PathVariable Long checkinId) {
        return ResponseEntity.ok(photoService.getPhotosByCheckin(SecurityUtils.getCurrentUserId(), checkinId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhotoResponse> getPhoto(@PathVariable Long id) {
        return ResponseEntity.ok(photoService.getPhoto(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    public ResponseEntity<PhotoResponse> createPhoto(@RequestBody PhotoRequest request) {
        PhotoResponse created = photoService.createPhoto(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id) {
        photoService.deletePhoto(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
