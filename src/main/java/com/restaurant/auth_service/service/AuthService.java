package com.restaurant.auth_service.service;

import com.restaurant.auth_service.dto.LoginRequest;
import com.restaurant.auth_service.dto.RegisterRequest;
import com.restaurant.auth_service.model.*;
import com.restaurant.auth_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantProfileRepository restaurantProfileRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. User Registration Logic
    @Transactional
    public String registerUser(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create and save User
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true); // Active by default for now
        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        User savedUser = userRepository.save(user);

        // Create and save Restaurant Profile
        RestaurantProfile profile = new RestaurantProfile();
        profile.setUserId(savedUser.getUserId());
        profile.setBusinessName(request.getBusinessName());
        profile.setOwnerName(request.getOwnerName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setWhatsappNumber(request.getWhatsappNumber());
        RestaurantProfile savedProfile = restaurantProfileRepository.save(profile);

        // Create and save Address
        if (request.getAddress() != null) {
            Address address = new Address();
            address.setRestaurantId(savedProfile.getRestaurantId());
            address.setAddressLine1(request.getAddress().getLine1());
            address.setAddressLine2(request.getAddress().getLine2());
            address.setArea(request.getAddress().getArea());
            address.setZipCode(request.getAddress().getZipCode());
            address.setState(request.getAddress().getState());
            addressRepository.save(address);
        }

        // Create and save Location Coordinates
        if (request.getLocation() != null) {
            Location location = new Location();
            location.setRestaurantId(savedProfile.getRestaurantId());
            location.setLatitude(request.getLocation().getLatitude());
            location.setLongitude(request.getLocation().getLongitude());
            locationRepository.save(location);
        }

        return "User registered successfully";
    }

    // 2. User Login Logic
    public String loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getIsLocked()) {
            throw new RuntimeException("Account is locked due to multiple failed login attempts.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Increment failed login attempts tracking
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setIsLocked(true);
            }
            userRepository.save(user);
            throw new RuntimeException("Invalid email or password");
        }

        // Reset failed attempts on success and update last login timestamp
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Return a mock token (or your JWT token generation service if implemented)
        return "mock-jwt-token-for-" + user.getEmail();
    }

    // 3. Generate Password Reset Token Logic
    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate a random reset token string
        String resetToken = UUID.randomUUID().toString();

        // Save token to password_resets table (expires in 15 minutes)
        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setUserId(user.getUserId());
        passwordReset.setResetToken(resetToken);
        passwordReset.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordReset.setIsUsed(false);

        passwordResetRepository.save(passwordReset);

        return resetToken;
    }
}