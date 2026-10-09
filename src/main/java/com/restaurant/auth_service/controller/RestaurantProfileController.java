package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @GetMapping("/{restaurantId}")
    public ResponseEntity<?> getProfile(@PathVariable String restaurantId) {
        try {
            UUID id = UUID.fromString(restaurantId);
            return profileRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{restaurantId}")
    public ResponseEntity<?> updateProfile(@PathVariable String restaurantId, @RequestBody RestaurantProfile updatedData) {
        try {
            UUID id = UUID.fromString(restaurantId);
            return profileRepository.findById(id).map(profile -> {
                profile.setBusinessName(updatedData.getBusinessName());
                profile.setOwnerName(updatedData.getOwnerName());
                profile.setPhoneNumber(updatedData.getPhoneNumber());
                profile.setWhatsappNumber(updatedData.getWhatsappNumber());
                
                RestaurantProfile saved = profileRepository.save(profile);
                return ResponseEntity.ok(saved);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}