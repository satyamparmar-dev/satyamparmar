package com.example.kafka.controller;

import com.example.kafka.dto.UserEvent;
import com.example.kafka.service.ProducerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final ProducerService producerService;
    
    public EventController(ProducerService producerService) {
        this.producerService = producerService;
    }
    
    @PostMapping("/user")
    public ResponseEntity<String> publishUserEvent(@RequestBody UserEvent event) {
        try {
            producerService.sendUserEvent(event);
            return ResponseEntity.ok("Event published successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to publish event: " + e.getMessage());
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Producer service is running");
    }
}
