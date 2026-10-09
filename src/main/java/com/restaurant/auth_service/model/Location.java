package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pg_locations")
public class Location {

    @Id
    @Column(name = "location_id")
    private String locationId;

    @Column(name = "restaurant_id", nullable = false)
    private String restaurantId;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public void setLatitude(Double latitude) { 
        this.latitude = latitude != null ? BigDecimal.valueOf(latitude) : null; 
    }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public void setLongitude(Double longitude) { 
        this.longitude = longitude != null ? BigDecimal.valueOf(longitude) : null; 
    }
}