package com.example.backend.repository;

import com.example.backend.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByCheckinId(Long checkinId);
    List<Photo> findByCheckinIdIn(List<Long> checkinIds);
    List<Photo> findByUserId(Long userId);
    long countByUserId(Long userId);
    void deleteByCheckinId(Long checkinId);
    void deleteByCheckinIdIn(List<Long> checkinIds);
}