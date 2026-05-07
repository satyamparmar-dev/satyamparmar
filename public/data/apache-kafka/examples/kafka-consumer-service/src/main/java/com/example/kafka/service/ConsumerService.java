package com.example.kafka.service;

import com.example.kafka.dto.UserEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class ConsumerService {
    
    private static final Logger logger = LoggerFactory.getLogger(ConsumerService.class);
    
    /**
     * Single message consumer
     */
    @KafkaListener(
        topics = "user-events",
        groupId = "user-events-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeUserEvent(
            @Payload UserEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received message: topic={}, partition={}, offset={}, userId={}, eventType={}",
                topic, partition, offset, event.getUserId(), event.getEventType());
            
            // Process the event
            processUserEvent(event);
            
            // Manually acknowledge
            acknowledgment.acknowledge();
            
            logger.info("Message processed and acknowledged: offset={}", offset);
            
        } catch (Exception e) {
            logger.error("Error processing message: topic={}, partition={}, offset={}", 
                topic, partition, offset, e);
            // Don't acknowledge - message will be retried
            // In production, implement dead-letter queue here
        }
    }
    
    /**
     * Process user event - implement your business logic here
     */
    private void processUserEvent(UserEvent event) {
        logger.info("Processing event: userId={}, eventType={}, timestamp={}", 
            event.getUserId(), event.getEventType(), event.getTimestamp());
        
        // Example business logic:
        // - Save to database
        // - Call external service
        // - Update cache
        // - Send notification
        
        switch (event.getEventType()) {
            case "LOGIN":
                handleLoginEvent(event);
                break;
            case "LOGOUT":
                handleLogoutEvent(event);
                break;
            case "PURCHASE":
                handlePurchaseEvent(event);
                break;
            default:
                logger.warn("Unknown event type: {}", event.getEventType());
        }
    }
    
    private void handleLoginEvent(UserEvent event) {
        logger.info("User logged in: {}", event.getUserId());
        // Implement login logic
    }
    
    private void handleLogoutEvent(UserEvent event) {
        logger.info("User logged out: {}", event.getUserId());
        // Implement logout logic
    }
    
    private void handlePurchaseEvent(UserEvent event) {
        logger.info("User made purchase: {}", event.getUserId());
        // Implement purchase logic
    }
}
