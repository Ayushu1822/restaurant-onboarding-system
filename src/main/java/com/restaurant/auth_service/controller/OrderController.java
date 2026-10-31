package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.repository.OrderRepository;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@EnableScheduling // ✅ turns on @Scheduled for the whole app
@RestController
@RequestMapping({"/api/orders", "/api/v1/orders"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class OrderController {

    // Matches what the dashboard's Accept button sends
    private static final String STATUS_NEW = "New";
    private static final String STATUS_APPROVED = "Accepted";

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantProfileRepository profileRepository;

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
            newOrder.setStatus(STATUS_NEW);
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

        applyAutoApproval(newOrder); // ✅ online orders only

        Order savedOrder = orderRepository.save(newOrder);
        System.out.println("✅ NEW ORDER CREATED for restaurant: " + savedOrder.getRestaurantEmail());
        return savedOrder;
    }

    // 🔄 SMART APPEND & MERGE ITEMS TO EXISTING ACTIVE TABLE ORDER (KOT UPDATE)
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
                    for (OrderItem incomingItem : incomingOrder.getItems()) {
                        // Check if this item already exists in the active table order
                        Optional<OrderItem> existingItemOpt = existingOrder.getItems().stream()
                            .filter(i -> i.getItemName() != null && i.getItemName().equalsIgnoreCase(incomingItem.getItemName()))
                            .findFirst();

                        if (existingItemOpt.isPresent()) {
                            // Item already exists -> Update quantity instead of creating a duplicate row
                            OrderItem existingItem = existingItemOpt.get();
                            existingItem.setQuantity(existingItem.getQuantity() + incomingItem.getQuantity());
                        } else {
                            // Brand new item -> Add to order items list
                            incomingItem.setItemId(UUID.randomUUID());
                            incomingItem.setOrder(existingOrder);
                            existingOrder.getItems().add(incomingItem);
                        }
                    }
                }

                // Recalculate Subtotal & Total Amount using BigDecimal safely
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
                System.out.println("✅ SMART TABLE ORDER UPDATED (ITEMS MERGED) — ID: " + updatedOrder.getOrderId());
                return ResponseEntity.ok(updatedOrder);
            }

            // Fallback: Create new order if no active order found
            Order created = createOrder(incomingOrder);
            return ResponseEntity.ok(created);

        } catch (Exception e) {
            System.err.println("❌ Error appending/merging items to table order: " + e.getMessage());
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
                    order.setAutoApproveAt(null); // ✅ staff acted, so cancel any pending auto-approval
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

    // =====================================================================
    // ⏱️ AUTO-APPROVAL (online orders only)
    // =====================================================================

    // Same rule the dashboard uses: anything that is not Counter / POS / Walk-in is online.
    // Table / dine-in orders are also excluded so they are never auto-approved.
    private boolean isOnlineOrder(Order order) {
        String ch = (order.getChannel() != null && !order.getChannel().trim().isEmpty())
                ? order.getChannel()
                : (order.getOrderType() != null ? order.getOrderType() : "");
        ch = ch.toUpperCase();
        if (ch.contains("COUNTER") || ch.contains("POS") || ch.contains("WALK-IN")) return false;
        if (ch.contains("TABLE") || ch.contains("DINE")) return false;

        String disp = order.getDisplayId() != null ? order.getDisplayId().toLowerCase() : "";
        if (disp.startsWith("table ")) return false;

        return true;
    }

    /** Called before saving a new order: approves it now, or sets the approve-at time, per the branch's saved setting. */
    private void applyAutoApproval(Order order) {
        if (!isOnlineOrder(order) || order.getRestaurantEmail() == null) return;
        if (!STATUS_NEW.equalsIgnoreCase(order.getStatus())) return;

        Optional<RestaurantProfile> profileOpt = profileRepository.findByEmail(order.getRestaurantEmail());
        if (profileOpt.isEmpty() || profileOpt.get().getAutoApproval() == null) return;

        String cfg = profileOpt.get().getAutoApproval();
        try {
            if (!readBool(cfg, "enabled", false)) return;

            if (readBool(cfg, "immediate", false)) {
                order.setStatus(STATUS_APPROVED);
                return;
            }
            long seconds = readLong(cfg, "minutes", 0) * 60 + readLong(cfg, "seconds", 0);
            if (seconds > 0) {
                order.setAutoApproveAt(Instant.now().plusSeconds(seconds));
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not read autoApproval settings for " + order.getRestaurantEmail() + ": " + e.getMessage());
        }
    }

    // Reads "key": true/false from a flat JSON string
    private boolean readBool(String json, String key, boolean def) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*(true|false)").matcher(json);
        return m.find() ? Boolean.parseBoolean(m.group(1)) : def;
    }

    // Reads "key": 123 (or "123") from a flat JSON string
    private long readLong(String json, String key, long def) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*\"?(\\d+)\"?").matcher(json);
        return m.find() ? Long.parseLong(m.group(1)) : def;
    }

    /** Runs every 5 seconds and approves online orders whose time limit has passed. */
    @Scheduled(fixedDelay = 5000)
    public void approveDueOrders() {
        List<Order> due = orderRepository.findByStatusAndAutoApproveAtLessThanEqual(STATUS_NEW, Instant.now());
        for (Order o : due) {
            int updated = orderRepository.approveIfStillNew(o.getOrderId(), STATUS_APPROVED);
            if (updated > 0) {
                System.out.println("⏱️ AUTO-APPROVED ORDER: " + o.getOrderId());
            }
        }
    }
}