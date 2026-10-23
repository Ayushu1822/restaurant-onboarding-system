package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String complaintId; // e.g., CMP-1001
    private String orderId;     // e.g., KO01/002978
    private String customerName;
    private String customerPhone;
    
    private String complaintType; // Missing Item, Wrong Item, Late Delivery, etc.
    private String channel;       // WhatsApp Ordering, Web Ordering, Zomato, etc.
    private String status;        // Open, Following Up, Closed
    
    private String notes;
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "restaurant_email")
    private String restaurantEmail; // ✅ Multi-tenant isolation field

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getComplaintType() { return complaintType; }
    public void setComplaintType(String complaintType) { this.complaintType = complaintType; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getRestaurantEmail() { return restaurantEmail; }
    public void setRestaurantEmail(String restaurantEmail) { this.restaurantEmail = restaurantEmail; }
}