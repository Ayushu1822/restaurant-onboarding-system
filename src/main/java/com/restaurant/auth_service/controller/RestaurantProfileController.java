package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getProfileByEmail(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                List<RestaurantProfile> allProfiles = profileRepository.findAll();
                for (RestaurantProfile p : allProfiles) {
                    if (p.getUserId() != null && p.getUserId().equals(user.getUserId())) {
                        return ResponseEntity.ok(p);
                    }
                }
            }
            
            List<RestaurantProfile> allProfiles = profileRepository.findAll();
            if (!allProfiles.isEmpty()) {
                return ResponseEntity.ok(allProfiles.get(0));
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{restaurantId}")
    public ResponseEntity<?> updateProfile(@PathVariable String restaurantId, @RequestBody RestaurantProfile updatedData) {
        try {
            UUID id;
            try {
                id = UUID.fromString(restaurantId);
            } catch (IllegalArgumentException e) {
                List<RestaurantProfile> allProfiles = profileRepository.findAll();
                if (!allProfiles.isEmpty()) {
                    Object rawId = allProfiles.get(0).getRestaurantId();
                    id = rawId instanceof UUID ? (UUID) rawId : UUID.fromString(String.valueOf(rawId));
                } else {
                    return ResponseEntity.status(404).body(Map.of("error", "Profile not found"));
                }
            }

            Optional<RestaurantProfile> profileOpt = profileRepository.findById(id);
            if (profileOpt.isEmpty()) {
                List<RestaurantProfile> allProfiles = profileRepository.findAll();
                if (!allProfiles.isEmpty()) {
                    profileOpt = Optional.of(allProfiles.get(0));
                }
            }

            if (profileOpt.isPresent()) {
                RestaurantProfile profile = profileOpt.get();
                if (updatedData.getBusinessName() != null) profile.setBusinessName(updatedData.getBusinessName());
                if (updatedData.getOwnerName() != null) profile.setOwnerName(updatedData.getOwnerName());
                if (updatedData.getPhoneNumber() != null) profile.setPhoneNumber(updatedData.getPhoneNumber());
                if (updatedData.getWhatsappNumber() != null) profile.setWhatsappNumber(updatedData.getWhatsappNumber());
                
                RestaurantProfile saved = profileRepository.save(profile);
                return ResponseEntity.ok(saved);
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}