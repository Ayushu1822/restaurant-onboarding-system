package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/restaurants", "/api/v1/restaurants"})
@CrossOrigin(origins = "*")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository restaurantProfileRepository;

    @GetMapping("/email/{email}")
    public ResponseEntity<RestaurantProfile> getRestaurantByEmail(@PathVariable String email) {
        return restaurantProfileRepository.findByEmail(email)
                .map(profile -> {
                    System.out.println("🏢 FETCHED PROFILE FOR EMAIL: " + email);
                    return ResponseEntity.ok(profile);
                })
                .orElseGet(() -> {
                    System.out.println("⚠️ PROFILE NOT FOUND FOR EMAIL: " + email);
                    return ResponseEntity.notFound().build();
                });
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantProfile> updateRestaurant(
            @PathVariable String id, 
            @RequestBody RestaurantProfile updatedDetails) {
        
        // Convert string ID to UUID if your repository expects UUID, 
        // or keep as String if repository uses String. Here we use id directly as String:
        return restaurantProfileRepository.findById(id).map(profile -> {
            if (updatedDetails.getBusinessName() != null) {
                profile.setBusinessName(updatedDetails.getBusinessName());
            }
            if (updatedDetails.getOwnerName() != null) {
                profile.setOwnerName(updatedDetails.getOwnerName());
            }
            if (updatedDetails.getPhoneNumber() != null) {
                profile.setPhoneNumber(updatedDetails.getPhoneNumber());
            }
            if (updatedDetails.getWhatsappNumber() != null) {
                profile.setWhatsappNumber(updatedDetails.getWhatsappNumber());
            }
            
            RestaurantProfile saved = restaurantProfileRepository.save(profile);
            System.out.println("✅ RESTAURANT PROFILE UPDATED — ID: " + id);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> {
            System.out.println("❌ UPDATE FAILED: RESTAURANT ID NOT FOUND — " + id);
            return ResponseEntity.notFound().build();
        });
    }
}