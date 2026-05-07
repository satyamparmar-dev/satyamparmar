package com.enterprise.ecommerce.order.event;

public class OrderCancelledEvent extends BaseEvent {
    
    private String reason;
    
    public OrderCancelledEvent() {
        super();
    }
    
    public OrderCancelledEvent(String orderId, String reason) {
        super(orderId);
        this.reason = reason;
    }
    
    // Getters and Setters
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
