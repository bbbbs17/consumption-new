package com.example.ImproveComsumption.domain;


import com.example.ImproveComsumption.domain.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Optional;

@Getter
@Setter
@Entity
@NoArgsConstructor
public class Consumption {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false,fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id",nullable = false)
    private Member member;


    @Column(nullable = false)
    private LocalDateTime localDateTime;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String placeName;  // 장소명 (예: 스타벅스 판교점)

    @Column(nullable = false)
    private String address;    // 도로명 주소 또는 지번주소

    @Column(nullable = false)
    private Double latitude;   // 위도

    @Column(nullable = false)
    private Double longitude;  // 경도

    @Column(nullable = false)
    private String item;

    @Enumerated(EnumType.STRING) // ✅ 추가
    private ConsumptionType type; // 수입(INCOME) / 지출(EXPENSE)



}
