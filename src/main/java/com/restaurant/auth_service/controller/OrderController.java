package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders != null ? orders : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            if (order.getOrderId() == null) {
                order.setOrderId(UUID.randomUUID());
            }
            if (order.getStatus() == null) {
                order.setStatus("New");
            }
            // Automatically tie it to your restaurant ID if missing
            if (order.getRestaurantId() == null) {
                order.setRestaurantId("ae41c831-372b-4f56-8905-f67a93b8045b");
            }

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to save order: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable UUID orderId, @RequestParam String status) {
        try {
            return orderRepository.findById(orderId).map(order -> {
                order.setStatus(status);
                orderRepository.save(order);
                return ResponseEntity.ok(order);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error updating status"));
        }
    }
}