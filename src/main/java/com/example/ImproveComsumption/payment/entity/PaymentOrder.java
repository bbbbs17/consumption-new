package com.example.ImproveComsumption.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_order")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private int amount;
    private String memberEmail;
    private boolean paid;

    private LocalDateTime createdAt;
}
