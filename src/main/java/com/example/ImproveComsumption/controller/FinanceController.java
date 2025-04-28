package com.example.ImproveComsumption.controller;

import com.example.ImproveComsumption.dto.FixedIncomeRequestDto;
import com.example.ImproveComsumption.dto.FixedIncomeResponseDto;
import com.example.ImproveComsumption.dto.balance.BalanceChangeRequestDto;
import com.example.ImproveComsumption.dto.balance.BalanceDto;
import com.example.ImproveComsumption.dto.balance.BalanceHistoryDto;
import com.example.ImproveComsumption.service.BalanceService;
import com.example.ImproveComsumption.service.FixedIncomeService;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequiredArgsConstructor
@RequestMapping("/api/finance")
public class FinanceController {

    private final BalanceService balanceService;
    private final FixedIncomeService fixedIncomeService;

    @GetMapping("/balance")
    public BalanceDto getBalance(@RequestParam String email) {
        return balanceService.getBalanceByEmail(email);
    }

    @PostMapping("/balance/init")
    public void initializeBalance(
            @RequestParam String email,
            @RequestParam int initialAmount
    ) {
        balanceService.initializeBalance(email, initialAmount); // boolean 제거
    }




    @GetMapping("/balance/history")
    public List<BalanceHistoryDto> getBalanceHistory(
            @RequestParam String email,
            @RequestParam @ApiParam(value = "조회할 연도", example = "2025") int year,
            @RequestParam @ApiParam(value = "조회할 월", example = "4") int month
    ) {
        return balanceService.getBalanceHistoryByMonth(email, year, month);
    }


    @PostMapping("/balance/change")
    public String changeBalance(@RequestBody BalanceChangeRequestDto requestDto) {
        balanceService.changeBalanceManually(requestDto);
        return "잔고 변경이 반영되었습니다.";
    }

    // ✅ 고정 수입 등록
    @PostMapping("/fixed-income/add")
    public String addFixedIncome(@RequestBody FixedIncomeRequestDto dto) {
        fixedIncomeService.addFixedIncome(dto);
        return "고정 수입이 등록되었습니다.";
    }

    // ✅ 고정 수입 전체 조회
    @GetMapping("/fixed-income")
    public List<FixedIncomeResponseDto> getFixedIncomes(@RequestParam String email) {
        return fixedIncomeService.getFixedIncomes(email);
    }

    // ✅ 고정 수입 삭제
    @DeleteMapping("/fixed-income/{id}")
    public String deleteFixedIncome(@PathVariable Long id) {
        fixedIncomeService.deleteFixedIncome(id);
        return "고정 수입이 삭제되었습니다.";
    }

}
