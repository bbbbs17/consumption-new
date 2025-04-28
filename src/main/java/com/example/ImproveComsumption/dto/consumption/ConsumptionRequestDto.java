package com.example.ImproveComsumption.dto.consumption;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class ConsumptionRequestDto {
    private String email;
    private int amount;
    private String item;
    private String place;
    private LocalDateTime localDateTime;;
}
