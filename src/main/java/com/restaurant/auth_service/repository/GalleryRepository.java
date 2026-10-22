package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryRepository extends JpaRepository<GalleryImage, String> {
    
    List<GalleryImage> findByRestaurantId(String restaurantId);

    @Query("SELECT g FROM GalleryImage g WHERE g.restaurantId = :restaurantId AND (:search IS NULL OR LOWER(g.fileName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<GalleryImage> findByRestaurantIdAndSearch(@Param("restaurantId") String restaurantId, @Param("search") String search);
}