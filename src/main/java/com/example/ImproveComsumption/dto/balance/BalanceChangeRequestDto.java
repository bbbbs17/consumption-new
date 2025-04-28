package com.example.ImproveComsumption.dto.balance;


import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 이게 있으면 new BalanceDto(총액, 갱신일) 가능
public class BalanceChangeRequestDto {


    private String email;
    private int amountChange; // (+수입 / -지출)
    private String reason;    // 예: "수입", "점심 지출", "월급 반영" 등
}
