package com.restaurant.auth_service.dto;

import java.math.BigDecimal;

public class RegisterRequest {
    private String email;
    private String password;
    private String businessName;
    private String ownerName;
    private String phoneNumber;
    private String whatsappNumber;
    
    private AddressDto address;
    private LocationDto location;

    // Nested Address DTO
    public static class AddressDto {
        private String line1;
        private String line2;
        private String area;
        private String zipCode;
        private String state;

        // Getters and Setters
        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getArea() { return area; }
        public void setArea(String area) { this.area = area; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
    }

    // Nested Location DTO
    public static class LocationDto {
        private BigDecimal latitude;
        private BigDecimal longitude;

        // Getters and Setters
        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    }

    // Getters and Setters for RegisterRequest
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public AddressDto getAddress() { return address; }
    public void setAddress(AddressDto address) { this.address = address; }
    public LocationDto getLocation() { return location; }
    public void setLocation(LocationDto location) { this.location = location; }
}