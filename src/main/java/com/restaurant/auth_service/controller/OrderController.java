package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
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
        
        // Keep PREPARING and READY visible in the kitchen queue; filter out only COMPLETED, DELIVERED, PICKED UP
        List<Order> activeOrders = allOrders.stream().filter(o -> {
            String status = o.getStatus() != null ? o.getStatus().toUpperCase() : "PREPARING";
            return !status.equals("COMPLETED") && !status.equals("DELIVERED") && !status.equals("PICKED UP");
        }).collect(Collectors.toList());

        System.out.println("📦 FETCHED ACTIVE ORDERS — Total Active: " + activeOrders.size());
        return activeOrders;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order newOrder) {
        if (newOrder.getStatus() == null || newOrder.getStatus().trim().isEmpty()) {
            newOrder.setStatus("Preparing");
        }

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
        System.out.println("✅ NEW ORDER CREATED — ID: " + savedOrder.getDisplayId() + " | Channel: " + savedOrder.getChannel());
        return savedOrder;
    }

    // 🔄 PERMANENT FIX: Endpoint for updating order status (Mark Ready / Complete)
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order updatedDetails) {
        try {
            Optional<Order> orderOpt = findOrderById(id);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if (updatedDetails.getStatus() != null && !updatedDetails.getStatus().trim().isEmpty()) {
                    order.setStatus(updatedDetails.getStatus());
                }
                if (updatedDetails.getCustomerName() != null) {
                    order.setCustomerName(updatedDetails.getCustomerName());
                }
                Order saved = orderRepository.save(order);
                System.out.println("🔄 ORDER STATUS UPDATED — ID: " + id + " | Status: " + saved.getStatus());
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Error updating order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 🗑️ PERMANENT FIX: Endpoint for deleting/dismissing an order
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        try {
            Optional<Order> orderOpt = findOrderById(id);
            if (orderOpt.isPresent()) {
                orderRepository.delete(orderOpt.get());
                System.out.println("🗑️ ORDER DELETED/DISMISSED — ID: " + id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Error deleting order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method using getOrderId() instead of getId()
    private Optional<Order> findOrderById(String id) {
        return orderRepository.findAll().stream()
            .filter(o -> {
                String oid = o.getOrderId() != null ? o.getOrderId().toString() : "";
                String dispId = o.getDisplayId() != null ? o.getDisplayId() : "";
                return oid.equalsIgnoreCase(id) || dispId.equalsIgnoreCase(id);
            })
            .findFirst();
    }

    // 🧹 EMERGENCY WIPE ENDPOINT
    @DeleteMapping("/clear-all")
    public String clearAllOrders() {
        orderRepository.deleteAll();
        System.out.println("⚠️ DATABASE WIPED: All orders deleted via API.");
        return "SUCCESS: All orders deleted from the active database!";
    }
}