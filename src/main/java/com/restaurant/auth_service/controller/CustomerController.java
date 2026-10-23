package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Customer;
import com.restaurant.auth_service.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/customers", "/api/v1/customers"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    // ✅ FETCH CUSTOMERS STRICTLY FILTERED BY RESTAURANT EMAIL
    @GetMapping
    public List<Customer> getAllCustomers(@RequestParam(required = false) String email) {
        List<Customer> allCustomers = customerRepository.findAll();
        
        if (email == null || email.trim().isEmpty()) {
            return List.of(); // Safety: agar email nahi di toh empty return karo
        }

        return allCustomers.stream()
            .filter(c -> c.getRestaurantEmail() != null && c.getRestaurantEmail().equalsIgnoreCase(email))
            .collect(Collectors.toList());
    }

    // ✅ SAVE / UPDATE CUSTOMER TIED TO LOGGED-IN RESTAURANT EMAIL
    @PostMapping
    public ResponseEntity<Customer> saveCustomer(@RequestBody Customer customer) {
        if (customer.getRestaurantEmail() == null || customer.getRestaurantEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Check if customer exists strictly for this specific restaurant email
        List<Customer> allCustomers = customerRepository.findAll();
        Customer existing = allCustomers.stream()
            .filter(c -> c.getCustomerPhone() != null && 
                         c.getCustomerPhone().equalsIgnoreCase(customer.getCustomerPhone()) &&
                         c.getRestaurantEmail() != null && 
                         c.getRestaurantEmail().equalsIgnoreCase(customer.getRestaurantEmail()))
            .findFirst()
            .orElse(null);

        if (existing != null) {
            existing.setCustomerName(customer.getCustomerName());
            existing.setGender(customer.getGender());
            existing.setAgeGroup(customer.getAgeGroup());
            existing.setPreferredFood(customer.getPreferredFood());
            existing.setWhatsappNumber(customer.getWhatsappNumber());
            existing.setCustomerEmail(customer.getCustomerEmail());
            existing.setAddress(customer.getAddress());
            
            Customer updated = customerRepository.save(existing);
            System.out.println("✅ CUSTOMER UPDATED for restaurant: " + updated.getRestaurantEmail());
            return ResponseEntity.ok(updated);
        }

        Customer saved = customerRepository.save(customer);
        System.out.println("✅ NEW CUSTOMER SAVED for restaurant: " + saved.getRestaurantEmail());
        return ResponseEntity.ok(saved);
    }
}