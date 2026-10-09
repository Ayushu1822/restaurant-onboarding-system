package com.restaurant.auth_service.service;

import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.model.Address;
import com.restaurant.auth_service.model.Location;
import com.restaurant.auth_service.repository.UserRepository;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import com.restaurant.auth_service.repository.AddressRepository;
import com.restaurant.auth_service.repository.LocationRepository;
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
    private AddressRepository addressRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(Map<String, Object> request) {
        String email = (String) request.get("email");
        if (email == null || userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is missing or already registered!");
        }

        String userId = UUID.randomUUID().toString();
        String restaurantId = UUID.randomUUID().toString();

        // 1. Save User
        User user = new User();
        user.setUserId(userId);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode((String) request.get("password")));
        user.setBusinessName((String) request.get("businessName"));
        user.setOwnerName((String) request.get("ownerName"));
        user.setPhoneNumber((String) request.get("phoneNumber"));
        user.setWhatsappNumber((String) request.get("whatsappNumber"));
        User savedUser = userRepository.save(user);

        // 2. Save Restaurant Profile
        RestaurantProfile profile = new RestaurantProfile();
        profile.setRestaurantId(restaurantId);
        profile.setUserId(userId);
        profile.setBusinessName((String) request.get("businessName"));
        profile.setOwnerName((String) request.get("ownerName"));
        profile.setPhoneNumber((String) request.get("phoneNumber"));
        profile.setWhatsappNumber((String) request.get("whatsappNumber"));
        profileRepository.save(profile);

        // 3. Save Address if provided
        Map<String, Object> addressMap = (Map<String, Object>) request.get("address");
        if (addressMap != null) {
            Address address = new Address();
            address.setAddressId(UUID.randomUUID().toString());
            address.setRestaurantId(restaurantId);
            address.setAddressLine1((String) addressMap.get("line1"));
            address.setAddressLine2((String) addressMap.get("line2"));
            address.setArea((String) addressMap.get("area"));
            address.setZipCode((String) addressMap.get("zipCode"));
            address.setState((String) addressMap.get("state"));
            addressRepository.save(address);
        }

        // 4. Save Location if provided
        Map<String, Object> locationMap = (Map<String, Object>) request.get("location");
        if (locationMap != null) {
            Location location = new Location();
            location.setLocationId(UUID.randomUUID().toString());
            location.setRestaurantId(restaurantId);
            if (locationMap.get("latitude") != null) {
                location.setLatitude(Double.valueOf(locationMap.get("latitude").toString()));
            }
            if (locationMap.get("longitude") != null) {
                location.setLongitude(Double.valueOf(locationMap.get("longitude").toString()));
            }
            locationRepository.save(location);
        }

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