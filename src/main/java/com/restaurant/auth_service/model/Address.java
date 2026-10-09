package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pg_addresses")
public class Address {

    @Id
    @Column(name = "address_id")
    private String addressId;

    @Column(name = "restaurant_id", nullable = false)
    private String restaurantId;

    @Column(name = "address_line_1", nullable = false, columnDefinition = "TEXT")
    private String addressLine1;

    @Column(name = "address_line_2", columnDefinition = "TEXT")
    private String addressLine2;

    private String area;

    @Column(name = "zip_code", nullable = false)
    private String zipCode;

    @Column(nullable = false)
    private String state;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public String getAddressId() { return addressId; }
    public void setAddressId(String addressId) { this.addressId = addressId; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}