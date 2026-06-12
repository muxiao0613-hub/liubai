package com.example.backend.service;

import com.example.backend.dto.TripRequest;
import com.example.backend.dto.TripResponse;
import com.example.backend.entity.Trip;
import com.example.backend.entity.TripCity;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.TripCityRepository;
import com.example.backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripCityRepository tripCityRepository;

    @Transactional(readOnly = true)
    public List<TripResponse> getTripsByUser(Long userId) {
        return tripRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TripResponse getTripResponse(Long userId, Long tripId) {
        return toResponse(getOwnedTrip(userId, tripId));
    }

    @Transactional
    public TripResponse createTrip(Long userId, TripRequest req) {
        Trip trip = new Trip();
        trip.setUserId(userId);
        trip.setName(req.getName());
        trip.setStartDate(parseDate(req.getStartDate()));
        trip.setEndDate(parseDate(req.getEndDate()));
        trip.setCoverPhoto(req.getCoverPhoto());
        trip.setNotes(req.getNotes());
        Trip saved = tripRepository.save(trip);
        saveCities(saved.getId(), req.getCityCodes());
        return toResponse(saved);
    }

    @Transactional
    public TripResponse updateTrip(Long userId, Long tripId, TripRequest req) {
        Trip trip = getOwnedTrip(userId, tripId);
        if (req.getName() != null) {
            trip.setName(req.getName());
        }
        trip.setStartDate(parseDate(req.getStartDate()));
        trip.setEndDate(parseDate(req.getEndDate()));
        if (req.getCoverPhoto() != null) {
            trip.setCoverPhoto(req.getCoverPhoto());
        }
        if (req.getNotes() != null) {
            trip.setNotes(req.getNotes());
        }
        tripRepository.save(trip);

        if (req.getCityCodes() != null) {
            tripCityRepository.deleteByTripId(tripId);
            saveCities(tripId, req.getCityCodes());
        }
        return toResponse(trip);
    }

    @Transactional
    public void deleteTrip(Long userId, Long tripId) {
        Trip trip = getOwnedTrip(userId, tripId);
        tripCityRepository.deleteByTripId(tripId);
        tripRepository.delete(trip);
    }

    /** 删除某用户的全部行程（管理员删除用户时调用）。 */
    @Transactional
    public void deleteAllForUser(Long userId) {
        for (Trip trip : tripRepository.findByUserId(userId)) {
            tripCityRepository.deleteByTripId(trip.getId());
            tripRepository.delete(trip);
        }
    }

    // ---- helpers ----

    private void saveCities(Long tripId, List<String> cityCodes) {
        if (cityCodes == null) {
            return;
        }
        cityCodes.stream().distinct().forEach(code -> {
            TripCity tc = new TripCity();
            tc.setTripId(tripId);
            tc.setCityCode(code);
            tripCityRepository.save(tc);
        });
    }

    private TripResponse toResponse(Trip trip) {
        List<String> cityCodes = tripCityRepository.findByTripId(trip.getId()).stream()
                .map(TripCity::getCityCode)
                .toList();
        return new TripResponse(
                trip.getId(),
                trip.getName(),
                trip.getStartDate() != null ? trip.getStartDate().toString() : "",
                trip.getEndDate() != null ? trip.getEndDate().toString() : "",
                trip.getCoverPhoto(),
                trip.getNotes(),
                trip.getCreatedAt() != null ? trip.getCreatedAt().toString() : null,
                cityCodes
        );
    }

    private Trip getOwnedTrip(Long userId, Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("行程不存在"));
        if (!trip.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该行程");
        }
        return trip;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("无效的日期格式: " + value);
        }
    }
}
