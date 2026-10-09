package com.restaurant.auth_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_item_modifiers")
public class OrderItemModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "modifier_id")
    private UUID modifierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    @JsonIgnore
    private OrderItem orderItem;

    @Column(name = "modifier_name", nullable = false)
    private String modifierName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "modifier_price", nullable = false)
    private BigDecimal modifierPrice;

    // Getters and Setters
    public UUID getModifierId() { return modifierId; }
    public void setModifierId(UUID modifierId) { this.modifierId = modifierId; }
    public String getModifierName() { return modifierName; }
    public void setModifierName(String modifierName) { this.modifierName = modifierName; }
    public BigDecimal getModifierPrice() { return modifierPrice; }
    public void setModifierPrice(BigDecimal modifierPrice) { this.modifierPrice = modifierPrice; }
}