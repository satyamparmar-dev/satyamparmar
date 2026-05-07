package com.enterprise.ecommerce.order.event;

public class PaymentProcessedEvent extends BaseEvent {
    
    private String paymentId;
    private PaymentStatus status;
    private String failureReason;
    
    public PaymentProcessedEvent() {
        super();
    }
    
    public PaymentProcessedEvent(String orderId, String paymentId, PaymentStatus status) {
        super(orderId);
        this.paymentId = paymentId;
        this.status = status;
    }
    
    // Getters and Setters
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public PaymentStatus getStatus() {
        return status;
    }
    
    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
    
    public String getFailureReason() {
        return failureReason;
    }
    
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
    
    public enum PaymentStatus {
        SUCCESS, FAILED
    }
}
