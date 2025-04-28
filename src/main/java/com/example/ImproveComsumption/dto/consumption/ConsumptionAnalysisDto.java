package com.example.ImproveComsumption.dto.consumption;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class ConsumptionAnalysisDto {
    private LocalDateTime dateTime;
    private String item;
    private String place;
    private int amount;
    private boolean habitual; // 습관 소비 여부
}
