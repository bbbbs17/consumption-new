package com.example.ImproveComsumption.dto.balance;


import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 이게 있으면 new BalanceDto(총액, 갱신일) 가능

public class BalanceDto {
    private int totalAmount;
    private LocalDateTime lastUpdated;
}
