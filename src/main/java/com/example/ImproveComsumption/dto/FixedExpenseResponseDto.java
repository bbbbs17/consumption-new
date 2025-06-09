package com.example.ImproveComsumption.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseResponseDto {

    private Long id;
    private String description;
    private int amount;
    private int dayOfMonth;
    private String status; // "반영완료" or "미반영"


}
