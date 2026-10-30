package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    // ✅ FETCH ALL ORDERS (Active + Completed) STRICTLY FILTERED BY RESTAURANT EMAIL
    @GetMapping
    public List<Order> getOrdersByEmail(@RequestParam(required = false) String email) {
        List<Order> allOrders = orderRepository.findAll();
        
        List<Order> filteredOrders = allOrders.stream().filter(o -> {
            if (email != null && !email.trim().isEmpty()) {
                if (o.getRestaurantEmail() == null || !o.getRestaurantEmail().equalsIgnoreCase(email)) {
                    return false;
                }
            } else {
                return false; 
            }
            return true;
        }).collect(Collectors.toList());

        System.out.println("📦 FETCHED ALL ORDERS FOR EMAIL: " + email + " — Count: " + filteredOrders.size());
        return filteredOrders;
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
        System.out.println("✅ NEW ORDER CREATED for restaurant: " + savedOrder.getRestaurantEmail());
        return savedOrder;
    }

    // 🔄 APPEND ITEMS TO EXISTING ACTIVE TABLE ORDER (KOT UPDATE - FIXED BigDecimal Arithmetic)
    @PutMapping("/table/{tableName}/append")
    public ResponseEntity<Order> appendItemsToTableOrder(
            @PathVariable String tableName,
            @RequestParam String email,
            @RequestBody Order incomingOrder) {
        try {
            Optional<Order> activeOrderOpt = orderRepository.findAll().stream()
                .filter(o -> o.getRestaurantEmail() != null && o.getRestaurantEmail().equalsIgnoreCase(email))
                .filter(o -> o.getDisplayId() != null && o.getDisplayId().equalsIgnoreCase("Table " + tableName))
                .filter(o -> !"Completed".equalsIgnoreCase(o.getStatus()) && !"Settled".equalsIgnoreCase(o.getStatus()))
                .findFirst();

            if (activeOrderOpt.isPresent()) {
                Order existingOrder = activeOrderOpt.get();

                if (incomingOrder.getItems() != null) {
                    for (OrderItem newItem : incomingOrder.getItems()) {
                        newItem.setItemId(UUID.randomUUID());
                        newItem.setOrder(existingOrder);
                        existingOrder.getItems().add(newItem);
                    }
                }

                // ✅ FIXED: Safely calculate subtotal using BigDecimal multiply
                BigDecimal newSubtotal = BigDecimal.ZERO;
                if (existingOrder.getItems() != null) {
                    for (OrderItem item : existingOrder.getItems()) {
                        BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                        BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
                        newSubtotal = newSubtotal.add(price.multiply(qty));
                    }
                }
                
                existingOrder.setSubtotal(newSubtotal);
                existingOrder.setTotalAmount(newSubtotal);

                Order updatedOrder = orderRepository.save(existingOrder);
                System.out.println("✅ EXISTING TABLE ORDER UPDATED (KOT APPENDED) — ID: " + updatedOrder.getOrderId());
                return ResponseEntity.ok(updatedOrder);
            }

            Order created = createOrder(incomingOrder);
            return ResponseEntity.ok(created);

        } catch (Exception e) {
            System.err.println("❌ Error appending items to table order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

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
                    if (body.containsKey("customerRequest")) {
                        order.setCustomerRequest((String) body.get("customerRequest"));
                    } else if (body.containsKey("notes")) {
                        order.setCustomerRequest((String) body.get("notes"));
                    }
                }

                Order saved = orderRepository.save(order);
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        Optional<Order> orderOpt = findOrderById(id);
        if (orderOpt.isPresent()) {
            orderRepository.delete(orderOpt.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
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
}