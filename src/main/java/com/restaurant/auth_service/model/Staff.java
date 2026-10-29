package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "restaurant_staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String userIdCode; // e.g. U01, KC

    @Column(nullable = false)
    private String role; // CAPTAIN, MANAGER, ADMIN, etc.

    private String phone;

    private String status = "Active"; // Active or Inactive

    private String restaurantEmail; // To link staff to specific restaurant login

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserIdCode() { return userIdCode; }
    public void setUserIdCode(String userIdCode) { this.userIdCode = userIdCode; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRestaurantEmail() { return restaurantEmail; }
    public void setRestaurantEmail(String restaurantEmail) { this.restaurantEmail = restaurantEmail; }
}