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
    public ResponseEntity<?> updateProfile(
            @PathVariable String id, 
            @RequestBody RestaurantProfile updatedDetails) {
        
        RestaurantProfile profile = profileRepository.findById(id).orElse(null);
        
        if (profile == null && updatedDetails.getEmail() != null) {
            profile = profileRepository.findByEmail(updatedDetails.getEmail()).orElse(null);
        }

        if (profile == null) {
            profile = new RestaurantProfile();
            profile.setRestaurantId(id != null ? id : UUID.randomUUID().toString());
        }

        // Check if phone number is already taken by another restaurant profile
        if (updatedDetails.getPhoneNumber() != null) {
            Optional<RestaurantProfile> existingWithPhone = profileRepository.findByPhoneNumber(updatedDetails.getPhoneNumber());
            if (existingWithPhone.isPresent() && !existingWithPhone.get().getRestaurantId().equals(profile.getRestaurantId())) {
                return ResponseEntity.badRequest().body("Phone number already exists! Please use a different number.");
            }
            profile.setPhoneNumber(updatedDetails.getPhoneNumber());
        }

        // 📝 Basic & Identity Info
        if (updatedDetails.getBusinessName() != null) profile.setBusinessName(updatedDetails.getBusinessName());
        if (updatedDetails.getOwnerName() != null) profile.setOwnerName(updatedDetails.getOwnerName());
        if (updatedDetails.getWhatsappNumber() != null) profile.setWhatsappNumber(updatedDetails.getWhatsappNumber());
        if (updatedDetails.getEmail() != null) profile.setEmail(updatedDetails.getEmail());
        if (updatedDetails.getUserId() != null) profile.setUserId(updatedDetails.getUserId());

        // 🌐 Business Details & Numbers
        if (updatedDetails.getWebsite() != null) profile.setWebsite(updatedDetails.getWebsite());
        if (updatedDetails.getGstnNumber() != null) profile.setGstnNumber(updatedDetails.getGstnNumber());
        if (updatedDetails.getBusinessRegistrationNumber() != null) profile.setBusinessRegistrationNumber(updatedDetails.getBusinessRegistrationNumber());
        if (updatedDetails.getBusinessLicenseNumber() != null) profile.setBusinessLicenseNumber(updatedDetails.getBusinessLicenseNumber());

        // 📍 Address & Geo Coordinates
        if (updatedDetails.getAddressLine1() != null) profile.setAddressLine1(updatedDetails.getAddressLine1());
        if (updatedDetails.getAddressLine2() != null) profile.setAddressLine2(updatedDetails.getAddressLine2());
        if (updatedDetails.getArea() != null) profile.setArea(updatedDetails.getArea());
        if (updatedDetails.getCity() != null) profile.setCity(updatedDetails.getCity());
        if (updatedDetails.getState() != null) profile.setState(updatedDetails.getState());
        if (updatedDetails.getPinCode() != null) profile.setPinCode(updatedDetails.getPinCode());
        if (updatedDetails.getLatitude() != null) profile.setLatitude(updatedDetails.getLatitude());
        if (updatedDetails.getLongitude() != null) profile.setLongitude(updatedDetails.getLongitude());

        // 🏷️ Display Names & Short Codes
        if (updatedDetails.getOnlineRestaurantName() != null) profile.setOnlineRestaurantName(updatedDetails.getOnlineRestaurantName());
        if (updatedDetails.getBranchDisplayName() != null) profile.setBranchDisplayName(updatedDetails.getBranchDisplayName());
        if (updatedDetails.getBusinessShortCode() != null) profile.setBusinessShortCode(updatedDetails.getBusinessShortCode());
        if (updatedDetails.getBranchShortCode() != null) profile.setBranchShortCode(updatedDetails.getBranchShortCode());

        // 👤 Profile Specific Fields
        if (updatedDetails.getFirstName() != null) profile.setFirstName(updatedDetails.getFirstName());
        if (updatedDetails.getLastName() != null) profile.setLastName(updatedDetails.getLastName());
        if (updatedDetails.getPreferredLanguage() != null) profile.setPreferredLanguage(updatedDetails.getPreferredLanguage());

        // ⏰ Service Hours Configuration
        if (updatedDetails.getServiceHours() != null) {
            profile.setServiceHours(updatedDetails.getServiceHours());
        }

        // 🪑 Areas & Tables Configuration (THIS WAS MISSING!)
        if (updatedDetails.getAreasAndTables() != null) {
            profile.setAreasAndTables(updatedDetails.getAreasAndTables());
        }

        RestaurantProfile saved = profileRepository.save(profile);
        System.out.println("✅ PROFILE & TABLES SUCCESSFULLY SAVED — ID: " + saved.getRestaurantId());
        return ResponseEntity.ok(saved);
    }
}