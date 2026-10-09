package com.restaurant.auth_service.service;

import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.repository.UserRepository;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(String email, String password, String businessName, String ownerName, String phoneNumber) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setBusinessName(businessName);
        user.setOwnerName(ownerName);
        user.setPhoneNumber(phoneNumber);
        
        User savedUser = userRepository.save(user);

        RestaurantProfile profile = new RestaurantProfile();
        profile.setRestaurantId(UUID.randomUUID().toString());
        profile.setUserId(savedUser.getUserId());
        profile.setBusinessName(businessName != null ? businessName : "My Restaurant");
        profile.setOwnerName(ownerName != null ? ownerName : "Owner");
        profile.setPhoneNumber(phoneNumber != null ? phoneNumber : "0000000000");
        
        profileRepository.save(profile);

        return savedUser;
    }

    public Map<String, Object> loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("userId", user.getUserId());
        response.put("email", user.getEmail());
        response.put("businessName", user.getBusinessName());
        response.put("ownerName", user.getOwnerName());
        
        return response;
    }
}