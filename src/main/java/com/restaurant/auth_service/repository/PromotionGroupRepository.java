package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.PromotionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromotionGroupRepository extends JpaRepository<PromotionGroup, String> {
    List<PromotionGroup> findByRestaurantEmail(String restaurantEmail);
}