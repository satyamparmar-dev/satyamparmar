package com.enterprise.ecommerce.order.consumer;

import com.enterprise.ecommerce.order.event.PaymentProcessedEvent;
import com.enterprise.ecommerce.order.event.InventoryReservedEvent;
import com.enterprise.ecommerce.order.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class OrderEventConsumer {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderEventConsumer.class);
    
    private final OrderService orderService;
    
    public OrderEventConsumer(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @KafkaListener(topics = "payment-processed", groupId = "order-service-group")
    public void handlePaymentProcessed(
            @Payload PaymentProcessedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received payment-processed event: orderId={}, status={}, topic={}, partition={}, offset={}",
                event.getOrderId(), event.getStatus(), topic, partition, offset);
            
            boolean success = event.getStatus() == PaymentProcessedEvent.PaymentStatus.SUCCESS;
            orderService.handlePaymentProcessed(event.getOrderId(), success);
            
            acknowledgment.acknowledge();
            logger.info("Processed payment-processed event for order: {}", event.getOrderId());
            
        } catch (Exception e) {
            logger.error("Error processing payment-processed event: orderId={}", event.getOrderId(), e);
            // Don't acknowledge - will be retried
        }
    }
    
    @KafkaListener(topics = "inventory-reserved", groupId = "order-service-group")
    public void handleInventoryReserved(
            @Payload InventoryReservedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received inventory-reserved event: orderId={}, reserved={}, topic={}, partition={}, offset={}",
                event.getOrderId(), event.isReserved(), topic, partition, offset);
            
            orderService.handleInventoryReserved(event.getOrderId(), event.isReserved());
            
            acknowledgment.acknowledge();
            logger.info("Processed inventory-reserved event for order: {}", event.getOrderId());
            
        } catch (Exception e) {
            logger.error("Error processing inventory-reserved event: orderId={}", event.getOrderId(), e);
            // Don't acknowledge - will be retried
        }
    }
}
