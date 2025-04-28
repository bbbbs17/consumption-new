package com.example.ImproveComsumption.model;


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
    private String place;

    @Column(nullable = false)
    private String item;



}
