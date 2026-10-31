package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> { // <--- MUST BE UUID!

    // Orders still in the given status whose auto-approve time has passed
    List<Order> findByStatusAndAutoApproveAtLessThanEqual(String status, Instant now);

    // Approves only if the order is STILL "New", so it never overrides a staff accept/reject
    @Modifying
    @Transactional
    @Query(value = "UPDATE pg_orders SET status = :approved, auto_approve_at = NULL WHERE order_id = :id AND status = 'New'", nativeQuery = true)
    int approveIfStillNew(@Param("id") UUID id, @Param("approved") String approved);
}