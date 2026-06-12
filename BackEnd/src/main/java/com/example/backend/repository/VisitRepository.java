package com.example.backend.repository;

import com.example.backend.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByCityId(Long cityId);
    List<Visit> findByCityIdIn(List<Long> cityIds);
    void deleteByCityId(Long cityId);
}
