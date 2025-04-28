package com.example.ImproveComsumption.dto.consumption;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Data
@Getter
@Setter
public class ConsumptionDto {

    private Long id; // ✅ id 필드 추가
    private LocalDateTime localDateTime;
    private int amount;
    private String item;
    private String place;

}
