package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.KitchenOrder;
import com.restaurant.auth_service.repository.KitchenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/kitchen", "/api/v1/kitchen"})
@CrossOrigin(origins = "*")
public class KitchenController {

    @Autowired
    private KitchenRepository kitchenRepository;

    @GetMapping
    public List<KitchenOrder> getAllKitchenOrders() {
        return kitchenRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<KitchenOrder> createKitchenOrder(@RequestBody KitchenOrder order) {
        if (order.getStatus() == null) {
            order.setStatus("Preparing");
        }
        return ResponseEntity.ok(kitchenRepository.save(order));
    }

    @PutMapping("/{id}/ready")
    public ResponseEntity<KitchenOrder> markOrderReady(@PathVariable Long id) {
        return kitchenRepository.findById(id).map(order -> {
            order.setStatus("Ready");
            return ResponseEntity.ok(kitchenRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}