package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping({"/api/restaurants", "/api/v1/restaurants"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/email/{email}")
    public ResponseEntity<RestaurantProfile> getOrCreateProfileByEmail(@PathVariable String email) {
        RestaurantProfile profile = profileRepository.findByEmail(email).orElseGet(() -> {
            System.out.println("🌱 PROFILE NOT FOUND FOR " + email + " — AUTO-CREATING NEW PROFILE...");
            
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

        System.out.println("🏢 SERVING PROFILE FOR EMAIL: " + email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantProfile> updateProfile(
            @PathVariable String id, 
            @RequestBody RestaurantProfile updatedDetails) {
        
        // 1. Pehle ID se find karo, nahi toh email se find karo taaki insert ki jagah update ho
        RestaurantProfile profile = profileRepository.findById(id).orElse(null);
        
        if (profile == null && updatedDetails.getEmail() != null) {
            profile = profileRepository.findByEmail(updatedDetails.getEmail()).orElse(null);
        }

        if (profile == null) {
            // Agar phir bhi nahi mila, toh naya object banao
            profile = new RestaurantProfile();
            profile.setRestaurantId(id != null ? id : UUID.randomUUID().toString());
        }

        // 2. Fields update karo safely
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
        if (updatedDetails.getUserId() != null) {
            profile.setUserId(updatedDetails.getUserId());
        }

        RestaurantProfile saved = profileRepository.save(profile);
        System.out.println("✅ PROFILE SUCCESSFULLY SAVED/UPDATED — ID: " + saved.getRestaurantId());
        return ResponseEntity.ok(saved);
    }
}