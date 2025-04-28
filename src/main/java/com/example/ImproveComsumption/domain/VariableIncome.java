package com.example.ImproveComsumption.domain;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class VariableIncome {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime receivedAt;
}
