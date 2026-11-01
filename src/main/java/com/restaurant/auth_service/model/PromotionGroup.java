package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "promotion_groups")
@Data
public class PromotionGroup {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String type;
    
    @Column(length = 500)
    private String description;

    private int promotionsCount;
    private int activeCount;
    private int inactiveCount;

    @Column(nullable = false)
    private String restaurantEmail;
}