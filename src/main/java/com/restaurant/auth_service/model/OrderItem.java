package com.restaurant.auth_service.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "pg_order_items")
public class OrderItem {

    @Id
    @Column(name = "order_item_id")
    private UUID itemId;

    @Column(name = "item_id", nullable = false)
    private UUID duplicateItemId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "item_name", nullable = false)
    @JsonAlias({"itemName", "name", "dishName", "title"})
    private String itemName;

    @Column(nullable = false)
    @JsonAlias({"quantity", "qty"})
    private int quantity = 1;

    @Column(name = "unit_price", nullable = false)
    @JsonAlias({"unitPrice", "price", "rate", "amount"})
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "item_description")
    @JsonAlias({"itemDescription", "description", "instruction", "note"})
    private String itemDescription;

    @PrePersist
    @PreUpdate
    public void syncItemIds() {
        if (this.itemId == null) {
            this.itemId = UUID.randomUUID();
        }
        if (this.duplicateItemId == null) {
            this.duplicateItemId = this.itemId;
        }
        if (this.itemName == null || this.itemName.trim().isEmpty()) {
            this.itemName = "Custom Item";
        }
        if (this.unitPrice == null) {
            this.unitPrice = BigDecimal.ZERO;
        }
    }

    // Getters and Setters with explicit JSON property support
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { 
        this.itemId = itemId; 
        if (this.duplicateItemId == null) {
            this.duplicateItemId = itemId;
        }
    }

    public UUID getDuplicateItemId() { return duplicateItemId; }
    public void setDuplicateItemId(UUID duplicateItemId) { this.duplicateItemId = duplicateItemId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getItemName() { return itemName; }
    @JsonProperty("itemName")
    public void setItemName(String itemName) { this.itemName = itemName; }

    public int getQuantity() { return quantity; }
    @JsonProperty("quantity")
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    @JsonProperty("unitPrice")
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public String getItemDescription() { return itemDescription; }
    @JsonProperty("itemDescription")
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
}