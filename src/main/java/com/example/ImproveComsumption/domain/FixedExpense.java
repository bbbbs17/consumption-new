package com.example.ImproveComsumption.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class FixedExpense {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private int amount; // ❗ 지출도 양수로 저장할 건지, 아니면 음수로 저장할 건지 나중에 컨트롤러/서비스단에서 처리

    @Column(nullable = false)
    private String description; // 고정 지출 설명

    @Column(nullable = false)
    private int dayOfMonth; // 매월 몇일에 반영할지

    @Column(nullable = false, updatable = false)
    private LocalDate createdAt; // 생성일

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }
}
