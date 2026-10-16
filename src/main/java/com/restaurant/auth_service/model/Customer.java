package com.restaurant.auth_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pg_customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    private String gender;

    @Column(name = "age_group")
    private String ageGroup; // e.g., '25-34', '18-24'

    @Column(name = "preferred_food")
    private String preferredFood; // 'Veg', 'Non-Veg', 'Vegan', 'Eggetarian'

    @Column(name = "customer_phone", unique = true, nullable = false)
    private String customerPhone;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "customer_email")
    private String customerEmail;

    private String address;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getPreferredFood() { return preferredFood; }
    public void setPreferredFood(String preferredFood) { this.preferredFood = preferredFood; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}