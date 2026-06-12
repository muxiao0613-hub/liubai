package com.example.backend.service;

import com.example.backend.dto.PhotoRequest;
import com.example.backend.dto.PhotoResponse;
import com.example.backend.entity.Checkin;
import com.example.backend.entity.Photo;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final CheckinRepository checkinRepository;

    @Transactional(readOnly = true)
    public List<PhotoResponse> getPhotosByCheckin(Long userId, Long checkinId) {
        verifyCheckinOwnership(userId, checkinId);
        return photoRepository.findByCheckinId(checkinId).stream()
                .map(PhotoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PhotoResponse getPhoto(Long userId, Long photoId) {
        return PhotoResponse.from(getOwnedPhoto(userId, photoId));
    }

    @Transactional
    public PhotoResponse createPhoto(Long userId, PhotoRequest req) {
        if (req.getCheckinId() == null) {
            throw new BadRequestException("checkinId 不能为空");
        }
        verifyCheckinOwnership(userId, req.getCheckinId());

        Photo photo = new Photo();
        photo.setCheckinId(req.getCheckinId());
        photo.setUserId(userId);
        photo.setData(req.getData());
        photo.setThumbnail(req.getThumbnail());
        photo.setOriginalName(req.getOriginalName());
        photo.setTakenAt(req.getTakenAt());
        photo.setCaption(req.getCaption());
        return PhotoResponse.from(photoRepository.save(photo));
    }

    @Transactional
    public void deletePhoto(Long userId, Long photoId) {
        Photo photo = getOwnedPhoto(userId, photoId);
        photoRepository.delete(photo);
    }

    // ---- helpers ----

    private Photo getOwnedPhoto(Long userId, Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("照片不存在"));
        if (!photo.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该照片");
        }
        return photo;
    }

    private void verifyCheckinOwnership(Long userId, Long checkinId) {
        Checkin checkin = checkinRepository.findById(checkinId)
                .orElseThrow(() -> new ResourceNotFoundException("打卡记录不存在"));
        if (!checkin.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该打卡记录");
        }
    }
}
