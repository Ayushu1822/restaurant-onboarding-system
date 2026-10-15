package com.restaurant.auth_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable {

    @Id
    @Column(name = "table_id")
    private String tableId; // e.g., 'T1', 'T2', 'B1'
    
    private String section; // 'MAIN', 'PATIO', 'BAR'
    private int seats;
    private String status;  // 'Available', 'Occupied', 'Ready to Pay', 'Billing', 'Reserved'
    
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "visit_time")
    private String visitTime;
    
    @Column(name = "current_amount")
    private Double currentAmount;

    public RestaurantTable() {}

    // Getters and Setters
    public String getTableId() { return tableId; }
    public void setTableId(String tableId) { this.tableId = tableId; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public int getSeats() { return seats; }
    public void setSeats(int seats) { this.seats = seats; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getVisitTime() { return visitTime; }
    public void setVisitTime(String visitTime) { this.visitTime = visitTime; }

    public Double getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(Double currentAmount) { this.currentAmount = currentAmount; }
}