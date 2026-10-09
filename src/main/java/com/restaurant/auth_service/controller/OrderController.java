package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
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
            System.err.println("Error fetching orders: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList()); // Returns [] safely instead of 500 crash
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
            System.err.println("Error updating order status: " + e.getMessage());
            return ResponseEntity.status(500).body("Error updating status: " + e.getMessage());
        }
    }
}