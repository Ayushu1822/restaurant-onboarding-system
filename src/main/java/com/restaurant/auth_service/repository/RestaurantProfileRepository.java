package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.RestaurantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantProfileRepository extends JpaRepository<RestaurantProfile, UUID> {
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<RestaurantProfile> findByUserId(UUID userId);
}