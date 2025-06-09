package com.example.ImproveComsumption.payment.dto;

import lombok.Data;

@Data
public class PrepareRequestDto {
    private int amount;
    private String orderName;
}