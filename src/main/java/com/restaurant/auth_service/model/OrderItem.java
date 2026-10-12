@Entity
@Table(name = "pg_order_items")
public class OrderItem {

    @Id
    @Column(name = "order_item_id") // Changed from "item_id" to match Postgres
    private UUID itemId;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "item_name")
    private String itemName;

    private int quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "item_description")
    private String itemDescription;

    // Getters and Setters...
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
}