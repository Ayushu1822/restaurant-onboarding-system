package com.restaurant.auth_service.component;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private OrderRepository orderRepository;

    private final String RESTAURANT_ID = "ae41c831-372b-4f56-8905-f67a93b8045b";

    @Override
    public void run(String... args) throws Exception {
        // Seed if orders table is empty to avoid duplicating on every restart
        if (orderRepository.count() == 0) {

            // 1. Rahul Sharma
            Order o1 = createOrder("#KO01/000001", "Rahul Sharma", "9876543210", "12, MG Road, Bengaluru", "WhatsApp", "Delivery", "New", "518.00", "507.10",
                List.of(
                    createItem("Chicken Drumsticks", 2, "199.00", "Spicy · Serves 1"),
                    createItem("Sprite", 2, "60.00", "Cold 300ml")
                )
            );

            // 2. Neha Kapoor
            Order o2 = createOrder("#KO01/000002", "Neha Kapoor", "9811223399", "Indiranagar, Bengaluru", "Web", "Delivery", "New", "920.00", "986.00",
                List.of(
                    createItem("Lucknowi Biryani", 2, "350.00", "Authentic spices · Serves 2"),
                    createItem("Chicken 65", 1, "220.00", "Crispy starter")
                )
            );

            // 3. Karan Singh
            Order o3 = createOrder("#KO01/000003", "Karan Singh", "9123456711", "44, Residency Road, Bengaluru", "Web", "Pickup", "Accepted", "698.00", "733.00",
                List.of(
                    createItem("Paneer Tikka Sandwich", 2, "229.00", "Grilled with mint chutney"),
                    createItem("Cold Coffee", 2, "120.00", "Thick shake with ice cream")
                )
            );

            // 4. Ananya Verma
            Order o4 = createOrder("#KO01/000004", "Ananya Verma", "9988776655", "Koramangala 4th Block, Bengaluru", "Swiggy", "Delivery", "Preparing", "600.00", "655.00",
                List.of(
                    createItem("Butter Chicken", 1, "420.00", "Rich tomato gravy · Serves 2"),
                    createItem("Garlic Naan", 4, "45.00", "Tandoor baked")
                )
            );

            // 5. Vikram Malhotra
            Order o5 = createOrder("#KO01/000005", "Vikram Malhotra", "9711223344", "Jayanagar 3rd Block, Bengaluru", "Zomato", "Delivery", "Ready", "779.00", "742.95",
                List.of(
                    createItem("Pepperoni Pizza", 1, "599.00", "Large 12 inch"),
                    createItem("Coke Zero", 2, "90.00", "Can 330ml")
                )
            );

            // 6. Pooja Hegde
            Order o6 = createOrder("#KO01/000006", "Pooja Hegde", "9844556677", "MG Road Counter Pickup", "Web", "Pickup", "Picked Up", "620.00", "651.00",
                List.of(
                    createItem("Veg Hakka Noodles", 2, "180.00", "Wok tossed veggies"),
                    createItem("Chilli Paneer Dry", 1, "260.00", "Semi-gravy spicy")
                )
            );

            // 7. Siddharth Roy
            Order o7 = createOrder("#KO01/000007", "Siddharth Roy", "9122334455", "Ulsoor, Bengaluru", "WhatsApp", "Delivery", "New", "640.00", "692.00",
                List.of(
                    createItem("Mutton Rogan Josh", 1, "550.00", "Kashmiri style delicacy"),
                    createItem("Tandoori Roti", 3, "30.00", "Whole wheat")
                )
            );

            // 8. Meera Nambiar
            Order o8 = createOrder("#KO01/000008", "Meera Nambiar", "9899887766", "Whitefield, Bengaluru", "Web", "Delivery", "Accepted", "408.00", "415.90",
                List.of(
                    createItem("Crispy Veg Burger", 2, "149.00", "Potato & corn patty"),
                    createItem("French Fries", 1, "110.00", "Large salted")
                )
            );

            // 9. Aditya Rao
            Order o9 = createOrder("#KO01/000009", "Aditya Rao", "9333222111", "BTM Layout, Bengaluru", "Swiggy", "Delivery", "Preparing", "640.00", "692.00",
                List.of(
                    createItem("Hyderabadi Chicken Dum Biryani", 2, "320.00", "With mirchi ka salan")
                )
            );

            // 10. Divya Menon
            Order o10 = createOrder("#KO01/000010", "Divya Menon", "9555666777", "Residency Road Store Counter", "Web", "Pickup", "Ready", "630.00", "661.50",
                List.of(
                    createItem("Chocolate Lava Cake", 3, "150.00", "Warm gooey center"),
                    createItem("Vanilla Ice Cream Scoop", 3, "60.00", "Side serving")
                )
            );

            orderRepository.saveAll(List.of(o1, o2, o3, o4, o5, o6, o7, o8, o9, o10));
            System.out.println("✅ Successfully seeded 10 detailed orders with items into PostgreSQL!");
        }
    }

    private Order createOrder(String displayId, String customerName, String phone, String address, 
                              String channel, String type, String status, String subtotal, String total, List<OrderItem> items) {
        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setRestaurantId(RESTAURANT_ID);
        order.setDisplayId(displayId);
        order.setCustomerName(customerName);
        order.setCustomerPhone(phone);
        order.setDeliveryAddress(address);
        order.setChannel(channel);
        order.setOrderType(type);
        order.setStatus(status);
        order.setSubtotal(new BigDecimal(subtotal));
        order.setTotalAmount(new BigDecimal(total));
        order.setPaymentMethod("UPI");
        order.setPaymentStatus("PAID");

        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        return order;
    }

    private OrderItem createItem(String name, int qty, String price, String description) {
        OrderItem item = new OrderItem();
        item.setItemId(UUID.randomUUID());
        item.setItemName(name);
        item.setQuantity(qty);
        item.setUnitPrice(new BigDecimal(price));
        item.setItemDescription(description);
        return item;
    }
}