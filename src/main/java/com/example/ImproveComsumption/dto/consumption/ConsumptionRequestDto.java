package com.example.ImproveComsumption.dto.consumption;

import com.example.ImproveComsumption.domain.ConsumptionType;
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
    private String placeName;  // 장소명 (예: 스타벅스 판교점)

    private String address;    // 도로명 주소 또는 지번주소

    private Double latitude;   // 위도

    private Double longitude;  // 경도
    private LocalDateTime localDateTime;
    private ConsumptionType type;

}
