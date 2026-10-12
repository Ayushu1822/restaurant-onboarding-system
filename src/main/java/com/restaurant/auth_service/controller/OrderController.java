package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Enables your frontend dashboard to communicate with this backend
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    // 1. Fetch all orders (powers your frontend dashboard list)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. Create a brand new order dynamically (adds your 11th, 12th, etc. orders)
    @PostMapping
    public Order createOrder(@RequestBody Order newOrder) {
        if (newOrder.getItems() != null) {
            for (OrderItem item : newOrder.getItems()) {
                item.setItemId(UUID.randomUUID());
                item.setOrder(newOrder);
            }
        }
        return orderRepository.save(newOrder);
    }
}