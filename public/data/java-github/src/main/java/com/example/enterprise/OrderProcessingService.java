package com.example.enterprise;

import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Enterprise Order Processing Service
 * Demonstrates real-world usage of Java 8 streams in enterprise applications
 */
public class OrderProcessingService {

    // Domain Models
    static class Order {
        private String orderId;
        private String customerId;
        private List<OrderItem> items;
        private OrderStatus status;
        private double subtotal;
        private double tax;
        private double discount;
        private double total;
        private Customer customer;
        private String shippingAddress;

        // Constructors, getters, setters
        public Order(String orderId, String customerId, List<OrderItem> items) {
            this.orderId = orderId;
            this.customerId = customerId;
            this.items = items;
            this.status = OrderStatus.PENDING;
        }

        // Getters and setters
        public String getOrderId() { return orderId; }
        public String getCustomerId() { return customerId; }
        public List<OrderItem> getItems() { return items; }
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public double getSubtotal() { return subtotal; }
        public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
        public double getTax() { return tax; }
        public void setTax(double tax) { this.tax = tax; }
        public double getDiscount() { return discount; }
        public void setDiscount(double discount) { this.discount = discount; }
        public double getTotal() { return total; }
        public void setTotal(double total) { this.total = total; }
        public Customer getCustomer() { return customer; }
        public void setCustomer(Customer customer) { this.customer = customer; }
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    }

    static class OrderItem {
        private String productId;
        private int quantity;
        private double price;

        public OrderItem(String productId, int quantity, double price) {
            this.productId = productId;
            this.quantity = quantity;
            this.price = price;
        }

        public String getProductId() { return productId; }
        public int getQuantity() { return quantity; }
        public double getPrice() { return price; }
        public double getItemTotal() { return price * quantity; }
    }

    static class Customer {
        private String customerId;
        private String name;
        private String email;
        private String defaultAddress;
        private CustomerType type;

        public Customer(String customerId, String name, String email, String defaultAddress, CustomerType type) {
            this.customerId = customerId;
            this.name = name;
            this.email = email;
            this.defaultAddress = defaultAddress;
            this.type = type;
        }

        public String getCustomerId() { return customerId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getDefaultAddress() { return defaultAddress; }
        public CustomerType getType() { return type; }
    }

    enum OrderStatus {
        PENDING, VALIDATED, PROCESSED, SHIPPED, DELIVERED, CANCELLED
    }

    enum CustomerType {
        REGULAR, PREMIUM, VIP
    }

    // Processing Result
    static class ProcessingResult {
        private int processedCount;
        private int failedCount;
        private double totalValue;
        private List<Order> processedOrders;
        private List<String> errors;

        public ProcessingResult(int processedCount, int failedCount, double totalValue, 
                               List<Order> processedOrders, List<String> errors) {
            this.processedCount = processedCount;
            this.failedCount = failedCount;
            this.totalValue = totalValue;
            this.processedOrders = processedOrders;
            this.errors = errors;
        }

        public int getProcessedCount() { return processedCount; }
        public int getFailedCount() { return failedCount; }
        public double getTotalValue() { return totalValue; }
        public List<Order> getProcessedOrders() { return processedOrders; }
        public List<String> getErrors() { return errors; }

        @Override
        public String toString() {
            return String.format("Processed: %d, Failed: %d, Total Value: $%.2f", 
                processedCount, failedCount, totalValue);
        }
    }

    // Service dependencies (simplified)
    private Map<String, Customer> customerDatabase = new HashMap<>();
    private Map<String, Boolean> inventoryDatabase = new HashMap<>();

    public OrderProcessingService() {
        // Initialize mock data
        customerDatabase.put("C001", new Customer("C001", "Alice", "alice@example.com", 
            "123 Main St", CustomerType.PREMIUM));
        customerDatabase.put("C002", new Customer("C002", "Bob", "bob@example.com", 
            "456 Oak Ave", CustomerType.REGULAR));
        
        inventoryDatabase.put("P001", true);
        inventoryDatabase.put("P002", true);
        inventoryDatabase.put("P003", false);
    }

    /**
     * Main processing method - demonstrates complete pipeline
     */
    public ProcessingResult processOrders(List<Order> orders) {
        List<String> errors = new ArrayList<>();
        
        List<Order> processed = orders.stream()
            .filter(this::isValidOrder)
            .peek(order -> logOrder(order, "Validated"))
            .map(this::enrichOrder)
            .filter(order -> hasSufficientInventory(order, errors))
            .map(this::calculatePricing)
            .map(order -> applyDiscounts(order, errors))
            .peek(order -> order.setStatus(OrderStatus.PROCESSED))
            .collect(Collectors.toList());
        
        int failedCount = orders.size() - processed.size();
        double totalValue = processed.stream()
            .mapToDouble(Order::getTotal)
            .sum();
        
        return new ProcessingResult(
            processed.size(),
            failedCount,
            totalValue,
            processed,
            errors
        );
    }

    /**
     * Validation: Check if order is valid
     */
    private boolean isValidOrder(Order order) {
        return order != null
            && order.getOrderId() != null
            && order.getCustomerId() != null
            && order.getItems() != null
            && !order.getItems().isEmpty();
    }

    /**
     * Enrichment: Add customer information
     */
    private Order enrichOrder(Order order) {
        Customer customer = customerDatabase.get(order.getCustomerId());
        if (customer != null) {
            order.setCustomer(customer);
            order.setShippingAddress(customer.getDefaultAddress());
        }
        return order;
    }

    /**
     * Inventory Check: Verify all items are in stock
     */
    private boolean hasSufficientInventory(Order order, List<String> errors) {
        boolean allInStock = order.getItems().stream()
            .allMatch(item -> {
                Boolean inStock = inventoryDatabase.getOrDefault(item.getProductId(), false);
                if (!inStock) {
                    errors.add("Product " + item.getProductId() + " out of stock for order " + order.getOrderId());
                }
                return inStock;
            });
        return allInStock;
    }

    /**
     * Pricing: Calculate subtotal, tax, and total
     */
    private Order calculatePricing(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(OrderItem::getItemTotal)
            .sum();
        
        order.setSubtotal(subtotal);
        order.setTax(subtotal * 0.10); // 10% tax
        order.setTotal(subtotal + order.getTax());
        
        return order;
    }

    /**
     * Discounts: Apply customer-specific discounts
     */
    private Order applyDiscounts(Order order, List<String> errors) {
        if (order.getCustomer() == null) {
            errors.add("Customer not found for order " + order.getOrderId());
            return order;
        }
        
        double discount = 0.0;
        CustomerType type = order.getCustomer().getType();
        
        switch (type) {
            case VIP:
                discount = order.getSubtotal() * 0.20; // 20% discount
                break;
            case PREMIUM:
                discount = order.getSubtotal() * 0.10; // 10% discount
                break;
            case REGULAR:
                // No discount
                break;
        }
        
        order.setDiscount(discount);
        order.setTotal(order.getTotal() - discount);
        
        return order;
    }

    /**
     * Logging helper
     */
    private void logOrder(Order order, String message) {
        System.out.println(String.format("[%s] Order %s: %s", 
            message, order.getOrderId(), order.getCustomerId()));
    }

    /**
     * Example usage
     */
    public static void main(String[] args) {
        OrderProcessingService service = new OrderProcessingService();
        
        // Create sample orders
        List<Order> orders = Arrays.asList(
            new Order("O001", "C001", Arrays.asList(
                new OrderItem("P001", 2, 50.0),
                new OrderItem("P002", 1, 30.0)
            )),
            new Order("O002", "C002", Arrays.asList(
                new OrderItem("P001", 1, 50.0)
            )),
            new Order("O003", "C001", Arrays.asList(
                new OrderItem("P003", 1, 100.0) // Out of stock
            )),
            new Order("O004", null, Arrays.asList( // Invalid order
                new OrderItem("P001", 1, 50.0)
            ))
        );
        
        // Process orders
        ProcessingResult result = service.processOrders(orders);
        
        System.out.println("\n=== Processing Results ===");
        System.out.println(result);
        System.out.println("\nErrors:");
        result.getErrors().forEach(error -> System.out.println("  - " + error));
        
        System.out.println("\nProcessed Orders:");
        result.getProcessedOrders().forEach(order -> 
            System.out.println(String.format(
                "  Order %s: $%.2f (Customer: %s, Discount: $%.2f)",
                order.getOrderId(),
                order.getTotal(),
                order.getCustomer() != null ? order.getCustomer().getName() : "N/A",
                order.getDiscount()
            ))
        );
    }
}
