package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
        
        List<Order> activeOrders = allOrders.stream().filter(o -> {
            String status = o.getStatus() != null ? o.getStatus().toUpperCase() : "NEW";
            return !status.equals("COMPLETED") && !status.equals("DELIVERED") && !status.equals("PICKED UP");
        }).collect(Collectors.toList());

        System.out.println("📦 FETCHED ACTIVE ORDERS — Total Active: " + activeOrders.size());
        return activeOrders;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order newOrder) {
        if (newOrder.getStatus() == null || newOrder.getStatus().trim().isEmpty()) {
            newOrder.setStatus("New");
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
        System.out.println("✅ NEW ORDER CREATED — ID: " + savedOrder.getDisplayId() + " | Status: " + savedOrder.getStatus());
        return savedOrder;
    }

    // 🔄 UNIVERSAL STATUS & NOTE UPDATE
    @RequestMapping(value = {"/{id}/status", "/{id}"}, method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String id, 
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            String targetStatus = status;
            if (targetStatus == null && body != null && body.containsKey("status")) {
                targetStatus = (String) body.get("status");
            }

            Optional<Order> orderOpt = findOrderById(id);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                
                if (targetStatus != null && !targetStatus.trim().isEmpty()) {
                    order.setStatus(targetStatus);
                }
                
                if (body != null) {
                    if (body.containsKey("customerName")) {
                        order.setCustomerName((String) body.get("customerName"));
                    }
                    
                    // ✅ FIXED: Handle customerRequest / notes updates across all modules
                    if (body.containsKey("customerRequest")) {
                        order.setCustomerRequest((String) body.get("customerRequest"));
                    } else if (body.containsKey("customer_request")) {
                        order.setCustomerRequest((String) body.get("customer_request"));
                    } else if (body.containsKey("notes")) {
                        order.setCustomerRequest((String) body.get("notes"));
                    }
                }

                Order saved = orderRepository.save(order);
                System.out.println("🔄 ORDER UPDATED — ID: " + id + " | Status: " + saved.getStatus());
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Error updating order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        try {
            Optional<Order> orderOpt = findOrderById(id);
            if (orderOpt.isPresent()) {
                orderRepository.delete(orderOpt.get());
                System.out.println("🗑️ ORDER DELETED — ID: " + id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Error deleting order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private Optional<Order> findOrderById(String id) {
        return orderRepository.findAll().stream()
            .filter(o -> {
                String oid = o.getOrderId() != null ? o.getOrderId().toString() : "";
                String dispId = o.getDisplayId() != null ? o.getDisplayId() : "";
                return oid.equalsIgnoreCase(id) || dispId.equalsIgnoreCase(id);
            })
            .findFirst();
    }

    @DeleteMapping("/clear-all")
    public String clearAllOrders() {
        orderRepository.deleteAll();
        System.out.println("⚠️ DATABASE WIPED.");
        return "SUCCESS: All orders deleted!";
    }
}