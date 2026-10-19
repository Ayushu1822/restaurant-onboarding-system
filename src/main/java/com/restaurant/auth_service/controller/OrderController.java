package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/orders", "/api/v1/orders"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        List<Order> allOrders = orderRepository.findAll();
        
        // FIX 1: Filter out completed, ready, or picked up orders so only active queue shows up
        List<Order> activeOrders = allOrders.stream().filter(o -> {
            String status = o.getStatus() != null ? o.getStatus().toUpperCase() : "PREPARING";
            return !status.equals("COMPLETED") && !status.equals("READY") && !status.equals("PICKED UP");
        }).collect(Collectors.toList());

        System.out.println("📦 FETCHED ACTIVE ORDERS — Total Active: " + activeOrders.size() + " (Ignored completed)");
        return activeOrders;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order newOrder) {
        // FIX 2: Ensure new orders start with 'Preparing' status for Kitchen Display
        if (newOrder.getStatus() == null || newOrder.getStatus().trim().isEmpty()) {
            newOrder.setStatus("Preparing");
        }

        // FIX 3: Ensure customer name fallback for Counter POS / Walk-in orders
        if (newOrder.getCustomerName() == null || newOrder.getCustomerName().trim().isEmpty()) {
            newOrder.setCustomerName("Walk-In Guest");
        }

        if (newOrder.getItems() != null) {
            for (OrderItem item : newOrder.getItems()) {
                item.setItemId(UUID.randomUUID());
                item.setOrder(newOrder);
            }
        }
        
        Order savedOrder = orderRepository.save(newOrder);
        System.out.println("✅ NEW ORDER CREATED & SYNCED TO KITCHEN — ID: " + savedOrder.getDisplayId() + " | Channel: " + savedOrder.getChannel());
        return savedOrder;
    }

    // 🧹 EMERGENCY WIPE ENDPOINT (You can hit this once via Postman/Browser to clear old 53 test orders)
    @DeleteMapping("/clear-all")
    public String clearAllOrders() {
        orderRepository.deleteAll();
        System.out.println("⚠️ DATABASE WIPED: All orders have been deleted via API.");
        return "SUCCESS: All orders deleted from the active database!";
    }
}