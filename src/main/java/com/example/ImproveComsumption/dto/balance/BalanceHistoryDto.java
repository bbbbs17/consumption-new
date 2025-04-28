package com.example.ImproveComsumption.dto.balance;

import lombok.*;

import java.time.LocalDateTime;



@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 이게 있으면 new BalanceDto(총액, 갱신일) 가능
public class BalanceHistoryDto {

    private int amountChange;
    private String reason;
    private LocalDateTime createdAt;
    private int currentBalance; // 응답 시점의 잔고
    private int afterBalance;
}
