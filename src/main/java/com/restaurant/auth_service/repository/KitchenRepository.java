package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.KitchenOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitchenRepository extends JpaRepository<KitchenOrder, Long> {
    List<KitchenOrder> findByStatus(String status);
}