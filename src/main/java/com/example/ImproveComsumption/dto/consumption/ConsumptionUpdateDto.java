package com.example.ImproveComsumption.dto.consumption;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class ConsumptionUpdateDto {
    private Long id;                // 수정할 항목의 고유 ID
    private String item;
    private String place;
    private int amount;
    private LocalDateTime localDateTime;
}
