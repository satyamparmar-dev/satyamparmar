package com.enterprise.ecommerce.order.entity;

public enum OrderStatus {
    PENDING,        // Order created, waiting for payment and inventory
    CONFIRMED,      // Payment and inventory confirmed
    SHIPPED,        // Order shipped
    DELIVERED,      // Order delivered
    CANCELLED       // Order cancelled
}
