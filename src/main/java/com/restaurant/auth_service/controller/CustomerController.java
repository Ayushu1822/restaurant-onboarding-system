package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Customer;
import com.restaurant.auth_service.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/customers", "/api/v1/customers"})
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Customer> saveCustomer(@RequestBody Customer customer) {
        Customer existing = customerRepository.findByCustomerPhone(customer.getCustomerPhone());
        if (existing != null) {
            existing.setCustomerName(customer.getCustomerName());
            existing.setGender(customer.getGender());
            existing.setAgeGroup(customer.getAgeGroup());
            existing.setPreferredFood(customer.getPreferredFood());
            existing.setWhatsappNumber(customer.getWhatsappNumber());
            existing.setCustomerEmail(customer.getCustomerEmail());
            existing.setAddress(customer.getAddress());
            return ResponseEntity.ok(customerRepository.save(existing));
        }
        return ResponseEntity.ok(customerRepository.save(customer));
    }
}