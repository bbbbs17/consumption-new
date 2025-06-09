package com.example.ImproveComsumption.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseRequestDto {

    private String email;
    private String description;
    private int amount;
    private int dayOfMonth;
}
