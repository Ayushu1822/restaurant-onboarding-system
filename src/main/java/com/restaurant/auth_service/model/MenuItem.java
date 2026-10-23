package com.restaurant.auth_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pg_menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    private String category; // e.g., Combos, Starters, Biryanis, Sandwiches, Burgers

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    private String status = "LIVE"; // 'LIVE' or 'PAUSED'

    @Column(name = "catalog_name")
    private String catalogName = "Default In-House Menu"; // 'Default Online Menu' or 'Default In-House Menu'

    @Column(name = "restaurant_email")
    private String restaurantEmail; // ✅ Multi-tenant isolation field

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCatalogName() { return catalogName; }
    public void setCatalogName(String catalogName) { this.catalogName = catalogName; }

    public String getRestaurantEmail() { return restaurantEmail; }
    public void setRestaurantEmail(String restaurantEmail) { this.restaurantEmail = restaurantEmail; }
}