package com.restaurant.auth_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pg_restaurant_profiles")
public class RestaurantProfile {

    @Id
    @Column(name = "restaurant_id")
    private String restaurantId;

    @Column(name = "user_id")
    private String userId;

    private String email;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    // 🌐 Business Details & Numbers
    private String website;
    
    @Column(name = "gstn_number")
    private String gstnNumber;
    
    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;
    
    @Column(name = "business_license_number")
    private String businessLicenseNumber;

    // 📍 Address & Geo Coordinates
    @Column(name = "address_line_1")
    private String addressLine1;
    
    @Column(name = "address_line_2")
    private String addressLine2;
    
    private String area;
    private String city;
    private String state;
    
    @Column(name = "pin_code")
    private String pinCode;
    
    private String latitude;
    private String longitude;

    // 🏷️ Display Names & Short Codes
    @Column(name = "online_restaurant_name")
    private String onlineRestaurantName;
    
    @Column(name = "branch_display_name")
    private String branchDisplayName;
    
    @Column(name = "business_short_code")
    private String businessShortCode;
    
    @Column(name = "branch_short_code")
    private String branchShortCode;

    // 🖼️ Supplementary Images
    @Column(name = "whatsapp_banner_url")
    private String whatsappBannerUrl;

    @Column(name = "default_item_image_url")
    private String defaultItemImageUrl;

    // 👤 Profile Specific Fields
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "preferred_language")
    private String preferredLanguage;

    // ⏰ Service Hours Configuration
    @Column(name = "service_hours", columnDefinition = "TEXT")
    private String serviceHours;

    // 🪑 Areas & Tables Configuration
    @Column(name = "areas_and_tables", columnDefinition = "TEXT")
    private String areasAndTables;

    // 🛵 Delivery Configuration
    @Column(name = "delivery_config", columnDefinition = "TEXT")
    private String deliveryConfig;

    // 💳 Billing & Tax Configuration
    @Column(name = "billing_config", columnDefinition = "TEXT")
    private String billingConfig;

    // 📂 Custom Menus Configuration (Added here!)
    @Column(name = "custom_menus", columnDefinition = "TEXT")
    private String customMenus;

    // ================= Getters and Setters =================

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getGstnNumber() { return gstnNumber; }
    public void setGstnNumber(String gstnNumber) { this.gstnNumber = gstnNumber; }

    public String getBusinessRegistrationNumber() { return businessRegistrationNumber; }
    public void setBusinessRegistrationNumber(String businessRegistrationNumber) { this.businessRegistrationNumber = businessRegistrationNumber; }

    public String getBusinessLicenseNumber() { return businessLicenseNumber; }
    public void setBusinessLicenseNumber(String businessLicenseNumber) { this.businessLicenseNumber = businessLicenseNumber; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public String getLatitude() { return latitude; }
    public void setLatitude(String latitude) { this.latitude = latitude; }

    public String getLongitude() { return longitude; }
    public void setLongitude(String longitude) { this.longitude = longitude; }

    public String getOnlineRestaurantName() { return onlineRestaurantName; }
    public void setOnlineRestaurantName(String onlineRestaurantName) { this.onlineRestaurantName = onlineRestaurantName; }

    public String getBranchDisplayName() { return branchDisplayName; }
    public void setBranchDisplayName(String branchDisplayName) { this.branchDisplayName = branchDisplayName; }

    public String getBusinessShortCode() { return businessShortCode; }
    public void setBusinessShortCode(String businessShortCode) { this.businessShortCode = businessShortCode; }

    public String getBranchShortCode() { return branchShortCode; }
    public void setBranchShortCode(String branchShortCode) { this.branchShortCode = branchShortCode; }

    public String getWhatsappBannerUrl() { return whatsappBannerUrl; }
    public void setWhatsappBannerUrl(String whatsappBannerUrl) { this.whatsappBannerUrl = whatsappBannerUrl; }

    public String getDefaultItemImageUrl() { return defaultItemImageUrl; }
    public void setDefaultItemImageUrl(String defaultItemImageUrl) { this.defaultItemImageUrl = defaultItemImageUrl; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getServiceHours() { return serviceHours; }
    public void setServiceHours(String serviceHours) { this.serviceHours = serviceHours; }

    public String getAreasAndTables() { return areasAndTables; }
    public void setAreasAndTables(String areasAndTables) { this.areasAndTables = areasAndTables; }

    public String getDeliveryConfig() { return deliveryConfig; }
    public void setDeliveryConfig(String deliveryConfig) { this.deliveryConfig = deliveryConfig; }

    public String getBillingConfig() { return billingConfig; }
    public void setBillingConfig(String billingConfig) { this.billingConfig = billingConfig; }

    public String getCustomMenus() { return customMenus; }
    public void setCustomMenus(String customMenus) { this.customMenus = customMenus; }
}