package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.Checkin;
import com.example.backend.entity.City;
import com.example.backend.entity.Visit;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.CityRepository;
import com.example.backend.repository.PhotoRepository;
import com.example.backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;
    private final VisitRepository visitRepository;
    private final CheckinRepository checkinRepository;
    private final PhotoRepository photoRepository;

    @Transactional(readOnly = true)
    public List<CityResponse> getCitiesByUser(Long userId) {
        List<City> cities = cityRepository.findByUserId(userId);
        if (cities.isEmpty()) {
            return List.of();
        }
        List<Long> cityIds = cities.stream().map(City::getId).toList();

        Map<Long, List<Visit>> visitsByCity = visitRepository.findByCityIdIn(cityIds).stream()
                .collect(Collectors.groupingBy(Visit::getCityId));

        List<Checkin> checkins = checkinRepository.findByCityIdIn(cityIds);
        Map<Long, List<PhotoResponse>> photosByCheckin = loadPhotos(checkins);
        Map<Long, List<Checkin>> checkinsByCity = checkins.stream()
                .collect(Collectors.groupingBy(Checkin::getCityId));

        return cities.stream()
                .map(c -> buildResponse(c,
                        visitsByCity.getOrDefault(c.getId(), List.of()),
                        checkinsByCity.getOrDefault(c.getId(), List.of()),
                        photosByCheckin))
                .toList();
    }

    @Transactional(readOnly = true)
    public CityResponse getCityResponse(Long userId, Long cityId) {
        City city = getOwnedCity(userId, cityId);
        List<Checkin> checkins = checkinRepository.findByCityId(cityId);
        return buildResponse(city,
                visitRepository.findByCityId(cityId),
                checkins,
                loadPhotos(checkins));
    }

    @Transactional
    public CityResponse markCity(Long userId, MarkCityRequest req) {
        Visit.VisitStatus status = parseStatus(req.getStatus());
        LocalDate date = req.getVisitDate();

        City city = cityRepository.findByUserIdAndCityCode(userId, req.getCityCode()).orElse(null);
        if (city == null) {
            city = new City();
            city.setUserId(userId);
            city.setProvinceCode(req.getProvinceCode());
            city.setCityCode(req.getCityCode());
            city.setCityName(req.getCityName());
            city.setFirstVisit(date);
            city.setNotes("");
            city = cityRepository.save(city);
        } else if (date != null && (city.getFirstVisit() == null || date.isBefore(city.getFirstVisit()))) {
            city.setFirstVisit(date);
            city = cityRepository.save(city);
        }

        saveVisit(city.getId(), userId, date, status);
        return getCityResponse(userId, city.getId());
    }

    @Transactional
    public CityResponse addVisit(Long userId, Long cityId, VisitRequest req) {
        City city = getOwnedCity(userId, cityId);
        Visit.VisitStatus status = parseStatus(req.getStatus());
        LocalDate date = req.getVisitDate();
        saveVisit(city.getId(), userId, date, status);
        if (date != null && (city.getFirstVisit() == null || date.isBefore(city.getFirstVisit()))) {
            city.setFirstVisit(date);
            cityRepository.save(city);
        }
        return getCityResponse(userId, cityId);
    }

    @Transactional
    public CityResponse updateCity(Long userId, Long cityId, CityUpdateRequest req) {
        City city = getOwnedCity(userId, cityId);
        if (req.getNotes() != null) {
            city.setNotes(req.getNotes());
        }
        if (req.getFirstVisit() != null) {
            city.setFirstVisit(req.getFirstVisit());
        }
        cityRepository.save(city);
        return getCityResponse(userId, cityId);
    }

    @Transactional
    public void deleteCity(Long userId, Long cityId) {
        City city = getOwnedCity(userId, cityId);
        deleteCityCascade(city);
    }

    @Transactional
    public void deleteAllForUser(Long userId) {
        for (City city : cityRepository.findByUserId(userId)) {
            deleteCityCascade(city);
        }
    }

    // ---- helpers ----

    private void deleteCityCascade(City city) {
        List<Checkin> checkins = checkinRepository.findByCityId(city.getId());
        if (!checkins.isEmpty()) {
            photoRepository.deleteByCheckinIdIn(checkins.stream().map(Checkin::getId).toList());
            checkinRepository.deleteByCityId(city.getId());
        }
        visitRepository.deleteByCityId(city.getId());
        cityRepository.delete(city);
    }

    private void saveVisit(Long cityId, Long userId, LocalDate date, Visit.VisitStatus status) {
        Visit visit = new Visit();
        visit.setCityId(cityId);
        visit.setUserId(userId);
        visit.setVisitDate(date);
        visit.setStatus(status);
        visitRepository.save(visit);
    }

    private City getOwnedCity(Long userId, Long cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("城市不存在"));
        if (!city.getUserId().equals(userId)) {
            throw new ForbiddenException("无权访问该城市");
        }
        return city;
    }

    private Map<Long, List<PhotoResponse>> loadPhotos(List<Checkin> checkins) {
        if (checkins.isEmpty()) {
            return Map.of();
        }
        List<Long> checkinIds = checkins.stream().map(Checkin::getId).toList();
        return photoRepository.findByCheckinIdIn(checkinIds).stream()
                .map(PhotoResponse::from)
                .collect(Collectors.groupingBy(PhotoResponse::getCheckinId));
    }

    private CityResponse buildResponse(City c, List<Visit> visits, List<Checkin> checkins,
                                       Map<Long, List<PhotoResponse>> photosByCheckin) {
        List<String> visitedAt = visits.stream()
                .map(Visit::getVisitDate)
                .filter(Objects::nonNull)
                .map(LocalDate::toString)
                .sorted()
                .toList();
        List<String> statuses = visits.stream()
                .map(v -> v.getStatus().name().toLowerCase())
                .distinct()
                .toList();
        List<CheckinResponse> checkinResponses = checkins.stream()
                .map(ck -> CheckinResponse.from(ck, photosByCheckin.getOrDefault(ck.getId(), List.of())))
                .toList();

        return new CityResponse(
                c.getId(),
                c.getProvinceCode(),
                c.getCityCode(),
                c.getCityName(),
                c.getFirstVisit() != null ? c.getFirstVisit().toString() : null,
                c.getNotes(),
                visitedAt,
                statuses,
                checkinResponses
        );
    }

    private Visit.VisitStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Visit.VisitStatus.VISITED;
        }
        try {
            return Visit.VisitStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("无效的到访类型: " + status);
        }
    }
}
