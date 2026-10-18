package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "pg_kitchen_orders")
public class KitchenOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "display_id")
    private String displayId; // e.g., #2-0042, #000001

    private String orderType; // 'Dine-In', 'Delivery', 'Takeaway'
    private String tableInfo; // e.g., 'Table T2' or 'Table B1'
    private String orderNotes; // e.g., 'Burger without mayo. Kid\'s portion — cut into halves.'
    
    @Column(name = "time_ago")
    private String timeAgo = "Just now"; // e.g., '35m ago'

    private String status = "Preparing"; // 'Preparing', 'Ready'

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<KitchenOrderItem> items;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDisplayId() { return displayId; }
    public void setDisplayId(String displayId) { this.displayId = displayId; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getTableInfo() { return tableInfo; }
    public void setTableInfo(String tableInfo) { this.tableInfo = tableInfo; }

    public String getOrderNotes() { return orderNotes; }
    public void setOrderNotes(String orderNotes) { this.orderNotes = orderNotes; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<KitchenOrderItem> getItems() { return items; }
    public void setItems(List<KitchenOrderItem> items) { this.items = items; }
}