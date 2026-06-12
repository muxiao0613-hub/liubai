package com.example.backend.repository;

import com.example.backend.entity.TripCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripCityRepository extends JpaRepository<TripCity, Long> {
    List<TripCity> findByTripId(Long tripId);
    void deleteByTripId(Long tripId);
}