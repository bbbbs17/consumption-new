package com.example.ImproveComsumption.dto;


import com.example.ImproveComsumption.domain.Member;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 이게 있으면 new BalanceDto(총액, 갱신일) 가능

public class FixedIncomeRequestDto {


    private String email;

    private Member member;

    private int amount;

    private String description;

    private int dayOfMonth; // 매월 몇일에 반영할지

}
