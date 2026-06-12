package com.example.backend.repository;

import com.example.backend.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByUserId(Long userId);
    Optional<City> findByUserIdAndCityCode(Long userId, String cityCode);
    boolean existsByUserIdAndCityCode(Long userId, String cityCode);
    long countByUserId(Long userId);
    void deleteByUserId(Long userId);

    /** 全站城市记录按省份分组计数，降序。返回 [provinceCode, count]。 */
    @Query("SELECT c.provinceCode, COUNT(c) FROM City c GROUP BY c.provinceCode ORDER BY COUNT(c) DESC")
    List<Object[]> countGroupByProvince();
}