package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/orders", "/api/v1/orders"})
@CrossOrigin(origins = "*") 
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        System.out.println("📦 FETCHED FROM DATABASE — Total Orders: " + orders.size());
        for (Order o : orders) {
            System.out.println(" -> Display ID: " + o.getDisplayId() + " | Customer: " + o.getCustomerName());
        }
        return orders;
    }

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

    // 🧹 EMERGENCY WIPE ENDPOINT: Clears every single order from your active Render database
    @DeleteMapping("/clear-all")
    public String clearAllOrders() {
        orderRepository.deleteAll();
        System.out.println("⚠️ DATABASE WIPED: All orders have been deleted via API.");
        return "SUCCESS: All orders deleted from the active database!";
    }
}