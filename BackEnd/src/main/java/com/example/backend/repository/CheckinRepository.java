package com.example.backend.repository;

import com.example.backend.entity.Checkin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Long> {
    List<Checkin> findByUserId(Long userId);
    List<Checkin> findByCityId(Long cityId);
    List<Checkin> findByCityIdIn(List<Long> cityIds);
    long countByUserId(Long userId);
    void deleteByCityId(Long cityId);
}