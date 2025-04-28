package com.example.ImproveComsumption.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class BalanceHistory {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;


    @Column(nullable = false)
    private int amountChange; // +수입, -지출

    @Column(nullable = false)
    private String reason; // "수입", "지출", "월급 반영", 등

    @CreationTimestamp
    private LocalDateTime createdAt; // 이력 생성 시간

    @Column(nullable = false)
    private int afterBalance;


}
