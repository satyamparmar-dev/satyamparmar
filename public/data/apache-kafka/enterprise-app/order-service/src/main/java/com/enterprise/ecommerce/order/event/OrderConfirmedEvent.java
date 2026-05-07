package com.enterprise.ecommerce.order.event;

public class OrderConfirmedEvent extends BaseEvent {
    
    public OrderConfirmedEvent() {
        super();
    }
    
    public OrderConfirmedEvent(String orderId) {
        super(orderId);
    }
}
