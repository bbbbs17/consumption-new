package com.example.ImproveComsumption.dto;


import lombok.*;

import java.time.LocalDate;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 이게 있으면 new BalanceDto(총액, 갱신일) 가능
public class FixedIncomeResponseDto {


    private Long id;
    private int amount;
    private String description;
    private int dayOfMonth;
    private LocalDate createdAt;  // ← 고정 수입 등록일 (시점 판단용)
    private String status; // "반영전" or "반영완료"
}
