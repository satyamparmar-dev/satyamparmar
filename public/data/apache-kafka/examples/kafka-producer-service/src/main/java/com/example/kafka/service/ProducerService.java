package com.example.kafka.service;

import com.example.kafka.dto.UserEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class ProducerService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProducerService.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public ProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    
    /**
     * Send message synchronously
     */
    public void sendMessage(String topic, String key, Object message) {
        try {
            kafkaTemplate.send(topic, key, message);
            logger.info("Message sent successfully to topic: {}, key: {}", topic, key);
        } catch (Exception e) {
            logger.error("Error sending message to topic: {}", topic, e);
            throw new RuntimeException("Failed to send message", e);
        }
    }
    
    /**
     * Send message asynchronously with callback
     */
    public void sendMessageAsync(String topic, String key, Object message) {
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(topic, key, message);
        
        future.addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {
            @Override
            public void onSuccess(SendResult<String, Object> result) {
                logger.info("Message sent successfully: topic={}, partition={}, offset={}",
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
            
            @Override
            public void onFailure(Throwable ex) {
                logger.error("Failed to send message: topic={}, key={}", topic, key, ex);
                // Implement retry logic or dead-letter queue here
            }
        });
    }
    
    /**
     * Send user event to Kafka
     */
    public void sendUserEvent(UserEvent event) {
        sendMessageAsync("user-events", event.getUserId(), event);
    }
    
    /**
     * Send message to specific partition
     */
    public void sendToPartition(String topic, int partition, String key, Object message) {
        kafkaTemplate.send(topic, partition, key, message);
    }
}
