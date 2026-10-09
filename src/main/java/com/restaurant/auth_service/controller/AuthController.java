package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // Allows frontend to communicate without CORS blocks
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String businessName = request.get("businessName");
            String ownerName = request.get("ownerName");
            String phoneNumber = request.get("phoneNumber");

            User newUser = authService.registerUser(email, password, businessName, ownerName, phoneNumber);
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", newUser.getUserId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            Map<String, Object> response = authService.loginUser(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }
}