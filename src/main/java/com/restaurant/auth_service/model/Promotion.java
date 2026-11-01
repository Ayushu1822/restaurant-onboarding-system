package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {
    @Id
    private String id;

    private String groupName;
    
    @Column(nullable = false)
    private String code;

    private String icon;
    private String displayName;
    
    @Column(length = 500)
    private String displayDesc;
    
    @Column(length = 500)
    private String terms;

    private String internalName;
    private String offerType;
    private String discountVal;
    private String minOrder;
    private String maxDiscount;
    private String startDate;
    private String expiryDate;
    private String status;

    @Column(nullable = false)
    private String restaurantEmail;
}