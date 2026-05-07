package com.enterprise.ecommerce.order.event;

import com.enterprise.ecommerce.order.dto.OrderItemRequest;
import com.enterprise.ecommerce.order.dto.ShippingAddressRequest;
import java.math.BigDecimal;
import java.util.List;

public class OrderCreatedEvent extends BaseEvent {
    
    private String userId;
    private List<OrderItemRequest> items;
    private BigDecimal totalAmount;
    private ShippingAddressRequest shippingAddress;
    
    public OrderCreatedEvent() {
        super();
    }
    
    public OrderCreatedEvent(String orderId, String userId, List<OrderItemRequest> items, 
                            BigDecimal totalAmount, ShippingAddressRequest shippingAddress) {
        super(orderId);
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public ShippingAddressRequest getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(ShippingAddressRequest shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
