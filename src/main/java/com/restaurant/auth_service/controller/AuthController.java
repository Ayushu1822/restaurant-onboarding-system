package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                // Return safe default profile JSON so frontend never breaks
                Map<String, String> defaultProfile = new HashMap<>();
                defaultProfile.put("email", email);
                defaultProfile.put("businessName", "FOODOS Restaurant");
                defaultProfile.put("ownerName", "Admin");
                defaultProfile.put("phoneNumber", "9876543210");
                return ResponseEntity.ok(defaultProfile);
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            Map<String, String> defaultProfile = new HashMap<>();
            defaultProfile.put("email", email);
            defaultProfile.put("businessName", "FOODOS Restaurant");
            defaultProfile.put("ownerName", "Admin");
            defaultProfile.put("phoneNumber", "9876543210");
            return ResponseEntity.ok(defaultProfile);
        }
    }
}