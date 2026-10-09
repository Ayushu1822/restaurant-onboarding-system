package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

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
            System.out.println("ORDERS FOUND IN DB: " + (orders != null ? orders.size() : "null"));
            return ResponseEntity.ok(orders != null ? orders : Collections.emptyList());
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}