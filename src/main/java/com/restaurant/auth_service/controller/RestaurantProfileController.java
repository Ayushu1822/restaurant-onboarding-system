package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/restaurants", "/api/v1/restaurants"})
@CrossOrigin(origins = "*")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    // Social Media Style: Get profile by email. Auto-creates if missing!
    @GetMapping("/email/{email}")
    public ResponseEntity<RestaurantProfile> getOrCreateProfileByEmail(@PathVariable String email) {
        RestaurantProfile profile = profileRepository.findByEmail(email).orElseGet(() -> {
            System.out.println("🌱 PROFILE NOT FOUND FOR " + email + " — AUTO-CREATING NEW PROFILE...");
            
            // Look up user to pull their info if available
            User user = userRepository.findByEmail(email).orElse(null);
            
            RestaurantProfile newProfile = new RestaurantProfile();
            newProfile.setRestaurantId(UUID.randomUUID().toString());
            newProfile.setEmail(email);
            
            if (user != null) {
                newProfile.setUserId(user.getUserId());
                newProfile.setBusinessName(user.getBusinessName() != null ? user.getBusinessName() : "My Restaurant");
                newProfile.setOwnerName(user.getOwnerName() != null ? user.getOwnerName() : "Owner");
                newProfile.setPhoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber() : "9999999999");
                newProfile.setWhatsappNumber(user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "9999999999");
            } else {
                newProfile.setUserId(UUID.randomUUID().toString());
                newProfile.setBusinessName("My Restaurant");
                newProfile.setOwnerName("Owner");
                newProfile.setPhoneNumber("9999999999");
                newProfile.setWhatsappNumber("9999999999");
            }
            
            return profileRepository.save(newProfile);
        });

        return ResponseEntity.ok(profile);
    }

    // Social Media Style: Update profile with fallback auto-creation
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantProfile> updateProfile(
            @PathVariable String id, 
            @RequestBody RestaurantProfile updatedDetails) {
        
        RestaurantProfile profile = profileRepository.findById(id).orElseGet(() -> {
            RestaurantProfile p = new RestaurantProfile();
            p.setRestaurantId(id);
            return p;
        });

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
        if (updatedDetails.getEmail() != null) {
            profile.setEmail(updatedDetails.getEmail());
        }

        RestaurantProfile saved = profileRepository.save(profile);
        System.out.println("✅ PROFILE SUCCESSFULLY SAVED/UPDATED — ID: " + id);
        return ResponseEntity.ok(saved);
    }
}