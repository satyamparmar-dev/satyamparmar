package com.enterprise.ecommerce.order.event;

public class InventoryReservedEvent extends BaseEvent {
    
    private boolean reserved;
    private String failureReason;
    
    public InventoryReservedEvent() {
        super();
    }
    
    public InventoryReservedEvent(String orderId, boolean reserved) {
        super(orderId);
        this.reserved = reserved;
    }
    
    // Getters and Setters
    public boolean isReserved() {
        return reserved;
    }
    
    public void setReserved(boolean reserved) {
        this.reserved = reserved;
    }
    
    public String getFailureReason() {
        return failureReason;
    }
    
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
}
