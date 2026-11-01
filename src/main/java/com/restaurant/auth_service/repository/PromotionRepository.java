package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    List<Promotion> findByRestaurantEmail(String restaurantEmail);
}