package com.enterprise.ecommerce.order.service;

import com.enterprise.ecommerce.order.dto.*;
import com.enterprise.ecommerce.order.entity.Order;
import com.enterprise.ecommerce.order.entity.OrderItem;
import com.enterprise.ecommerce.order.entity.OrderStatus;
import com.enterprise.ecommerce.order.entity.ShippingAddress;
import com.enterprise.ecommerce.order.event.OrderCreatedEvent;
import com.enterprise.ecommerce.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    // Track order confirmation state per order (in production, use Redis or database)
    private final java.util.Map<String, OrderConfirmationState> orderStates = new java.util.concurrent.ConcurrentHashMap<>();
    
    public OrderService(OrderRepository orderRepository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;
    }
    
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        logger.info("Creating order for user: {}", request.getUserId());
        
        // Calculate total amount
        BigDecimal totalAmount = request.getItems().stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Convert DTOs to entities
        List<OrderItem> orderItems = request.getItems().stream()
            .map(item -> new OrderItem(item.getProductId(), item.getQuantity(), item.getPrice()))
            .collect(Collectors.toList());
        
        ShippingAddress shippingAddress = new ShippingAddress(
            request.getShippingAddress().getStreet(),
            request.getShippingAddress().getCity(),
            request.getShippingAddress().getState(),
            request.getShippingAddress().getZipCode(),
            request.getShippingAddress().getCountry()
        );
        
        // Create order
        Order order = new Order(request.getUserId(), orderItems, totalAmount, shippingAddress);
        order = orderRepository.save(order);
        
        logger.info("Order created: {}", order.getId());
        
        // Publish order-created event
        OrderCreatedEvent event = new OrderCreatedEvent(
            order.getId(),
            order.getUserId(),
            request.getItems(),
            totalAmount,
            request.getShippingAddress()
        );
        
        kafkaTemplate.send("order-created", order.getId(), event);
        logger.info("Published order-created event for order: {}", order.getId());
        
        return toResponse(order);
    }
    
    public OrderResponse getOrder(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return toResponse(order);
    }
    
    public List<OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void handlePaymentProcessed(String orderId, boolean success) {
        logger.info("Handling payment processed for order: {}, success: {}", orderId, success);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        OrderConfirmationState state = orderStates.computeIfAbsent(orderId, 
            k -> new OrderConfirmationState());
        
        if (success) {
            state.setPaymentProcessed(true);
            checkAndConfirmOrder(order, state);
        } else {
            cancelOrder(order, "Payment failed");
            orderStates.remove(orderId);
        }
    }
    
    @Transactional
    public void handleInventoryReserved(String orderId, boolean reserved) {
        logger.info("Handling inventory reserved for order: {}, reserved: {}", orderId, reserved);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        OrderConfirmationState state = orderStates.computeIfAbsent(orderId, 
            k -> new OrderConfirmationState());
        
        if (reserved) {
            state.setInventoryReserved(true);
            checkAndConfirmOrder(order, state);
        } else {
            cancelOrder(order, "Inventory reservation failed");
            orderStates.remove(orderId);
        }
    }
    
    private void checkAndConfirmOrder(Order order, OrderConfirmationState state) {
        if (state.isPaymentProcessed() && state.isInventoryReserved() 
            && order.getStatus() == OrderStatus.PENDING) {
            order.confirm();
            orderRepository.save(order);
            
            // Publish order-confirmed event
            com.enterprise.ecommerce.order.event.OrderConfirmedEvent event = 
                new com.enterprise.ecommerce.order.event.OrderConfirmedEvent(order.getId());
            kafkaTemplate.send("order-confirmed", order.getId(), event);
            
            logger.info("Order confirmed: {}", order.getId());
            
            // Clean up state
            orderStates.remove(order.getId());
        }
    }
    
    // Inner class to track order confirmation state
    private static class OrderConfirmationState {
        private boolean paymentProcessed = false;
        private boolean inventoryReserved = false;
        
        public boolean isPaymentProcessed() {
            return paymentProcessed;
        }
        
        public void setPaymentProcessed(boolean paymentProcessed) {
            this.paymentProcessed = paymentProcessed;
        }
        
        public boolean isInventoryReserved() {
            return inventoryReserved;
        }
        
        public void setInventoryReserved(boolean inventoryReserved) {
            this.inventoryReserved = inventoryReserved;
        }
    }
    
    private void cancelOrder(Order order, String reason) {
        if (order.getStatus() == OrderStatus.PENDING) {
            order.cancel();
            orderRepository.save(order);
            
            // Publish order-cancelled event
            com.enterprise.ecommerce.order.event.OrderCancelledEvent event = 
                new com.enterprise.ecommerce.order.event.OrderCancelledEvent(order.getId(), reason);
            kafkaTemplate.send("order-cancelled", order.getId(), event);
            
            logger.info("Order cancelled: {}, reason: {}", order.getId(), reason);
        }
    }
    
    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUserId());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Convert items
        List<OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> {
                OrderItemResponse itemResponse = new OrderItemResponse();
                itemResponse.setProductId(item.getProductId());
                itemResponse.setQuantity(item.getQuantity());
                itemResponse.setPrice(item.getPrice());
                itemResponse.setSubtotal(item.getSubtotal());
                return itemResponse;
            })
            .collect(Collectors.toList());
        response.setItems(itemResponses);
        
        // Convert shipping address
        ShippingAddressResponse addressResponse = new ShippingAddressResponse();
        addressResponse.setStreet(order.getShippingAddress().getStreet());
        addressResponse.setCity(order.getShippingAddress().getCity());
        addressResponse.setState(order.getShippingAddress().getState());
        addressResponse.setZipCode(order.getShippingAddress().getZipCode());
        addressResponse.setCountry(order.getShippingAddress().getCountry());
        response.setShippingAddress(addressResponse);
        
        return response;
    }
}
