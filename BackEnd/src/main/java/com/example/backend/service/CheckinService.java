package com.example.backend.service;

import com.example.backend.dto.CheckinRequest;
import com.example.backend.dto.CheckinResponse;
import com.example.backend.dto.PhotoRequest;
import com.example.backend.dto.PhotoResponse;
import com.example.backend.entity.Checkin;
import com.example.backend.entity.City;
import com.example.backend.entity.Photo;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.CityRepository;
import com.example.backend.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final CheckinRepository checkinRepository;
    private final PhotoRepository photoRepository;
    private final CityRepository cityRepository;

    @Transactional(readOnly = true)
    public List<CheckinResponse> getCheckinsByCity(Long userId, Long cityId) {
        verifyCityOwnership(userId, cityId);
        return checkinRepository.findByCityId(cityId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CheckinResponse createCheckin(Long userId, CheckinRequest req) {
        if (req.getCityId() == null) {
            throw new BadRequestException("cityId 不能为空");
        }
        verifyCityOwnership(userId, req.getCityId());

        Checkin checkin = new Checkin();
        checkin.setCityId(req.getCityId());
        checkin.setUserId(userId);
        checkin.setName(req.getName());
        checkin.setCategory(parseCategory(req.getCategory()));
        checkin.setDate(req.getDate());
        checkin.setNotes(req.getNotes());
        checkin.setLat(req.getLat());
        checkin.setLng(req.getLng());
        Checkin saved = checkinRepository.save(checkin);

        if (req.getPhotos() != null) {
            for (PhotoRequest pr : req.getPhotos()) {
                Photo photo = new Photo();
                photo.setCheckinId(saved.getId());
                photo.setUserId(userId);
                photo.setData(pr.getData());
                photo.setThumbnail(pr.getThumbnail());
                photo.setOriginalName(pr.getOriginalName());
                photo.setTakenAt(pr.getTakenAt());
                photo.setCaption(pr.getCaption());
                photoRepository.save(photo);
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public CheckinResponse updateCheckin(Long userId, Long checkinId, CheckinRequest req) {
        Checkin checkin = getOwnedCheckin(userId, checkinId);
        if (req.getName() != null) {
            checkin.setName(req.getName());
        }
        if (req.getCategory() != null) {
            checkin.setCategory(parseCategory(req.getCategory()));
        }
        if (req.getDate() != null) {
            checkin.setDate(req.getDate());
        }
        if (req.getNotes() != null) {
            checkin.setNotes(req.getNotes());
        }
        if (req.getLat() != null) {
            checkin.setLat(req.getLat());
        }
        if (req.getLng() != null) {
            checkin.setLng(req.getLng());
        }
        return toResponse(checkinRepository.save(checkin));
    }

    @Transactional
    public void deleteCheckin(Long userId, Long checkinId) {
        Checkin checkin = getOwnedCheckin(userId, checkinId);
        photoRepository.deleteByCheckinId(checkinId);
        checkinRepository.delete(checkin);
    }

    // ---- helpers ----

    private CheckinResponse toResponse(Checkin checkin) {
        List<PhotoResponse> photos = photoRepository.findByCheckinId(checkin.getId()).stream()
                .map(PhotoResponse::from)
                .toList();
        return CheckinResponse.from(checkin, photos);
    }

    private Checkin getOwnedCheckin(Long userId, Long checkinId) {
        Checkin checkin = checkinRepository.findById(checkinId)
                .orElseThrow(() -> new ResourceNotFoundException("打卡记录不存在"));
        if (!checkin.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该打卡记录");
        }
        return checkin;
    }

    private void verifyCityOwnership(Long userId, Long cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("城市不存在"));
        if (!city.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该城市");
        }
    }

    private Checkin.CheckinCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return Checkin.CheckinCategory.OTHER;
        }
        try {
            return Checkin.CheckinCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("无效的打卡分类: " + category);
        }
    }
}
