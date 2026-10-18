package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.RestaurantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RestaurantProfileRepository extends JpaRepository<RestaurantProfile, String> {
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<RestaurantProfile> findByEmail(String email);
    Optional<RestaurantProfile> findByUserId(String userId);
}