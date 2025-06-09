package com.example.ImproveComsumption.controller;

import com.example.ImproveComsumption.dto.FixedIncomeRequestDto;
import com.example.ImproveComsumption.dto.FixedIncomeResponseDto;
import com.example.ImproveComsumption.dto.FixedExpenseRequestDto;
import com.example.ImproveComsumption.dto.FixedExpenseResponseDto;
import com.example.ImproveComsumption.dto.balance.BalanceChangeRequestDto;
import com.example.ImproveComsumption.dto.balance.BalanceDto;
import com.example.ImproveComsumption.dto.balance.BalanceHistoryDto;
import com.example.ImproveComsumption.service.BalanceService;
import com.example.ImproveComsumption.service.FixedIncomeService;
import com.example.ImproveComsumption.service.FixedExpenseService;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequiredArgsConstructor
@RequestMapping("/api/finance")
public class FinanceController {

    private final BalanceService balanceService;
    private final FixedIncomeService fixedIncomeService;
    private final FixedExpenseService fixedExpenseService;

    // --- [ 잔고 관련 ] ---
    @GetMapping("/balance")
    public ResponseEntity<BalanceDto> getBalance(@RequestParam String email) {
        return ResponseEntity.ok(balanceService.getBalanceByEmail(email));
    }

    @PostMapping("/balance/init")
    public ResponseEntity<Map<String, String>> initializeBalance(
            @RequestParam String email,
            @RequestParam int initialAmount) {
        balanceService.initializeBalance(email, initialAmount);
        return ResponseEntity.ok(Map.of("message", "잔고가 초기화되었습니다."));
    }

    @GetMapping("/balance/history")
    public ResponseEntity<List<BalanceHistoryDto>> getBalanceHistory(
            @RequestParam String email,
            @RequestParam @ApiParam(value = "조회할 연도", example = "2025") int year,
            @RequestParam @ApiParam(value = "조회할 월", example = "4") int month) {
        return ResponseEntity.ok(balanceService.getBalanceHistoryByMonth(email, year, month));
    }

    @PostMapping("/balance/change")
    public ResponseEntity<Map<String, String>> changeBalance(@RequestBody BalanceChangeRequestDto requestDto) {
        balanceService.changeBalanceManually(requestDto);
        return ResponseEntity.ok(Map.of("message", "잔고 변경이 반영되었습니다."));
    }

    // --- [ 고정 수입 관련 ] ---
    @PostMapping("/fixed-income/add")
    public ResponseEntity<Map<String, String>> addFixedIncome(@RequestBody FixedIncomeRequestDto dto) {
        fixedIncomeService.addFixedIncome(dto);
        return ResponseEntity.ok(Map.of("message", "고정 수입이 등록되었습니다."));
    }

    @GetMapping("/fixed-income")
    public ResponseEntity<List<FixedIncomeResponseDto>> getFixedIncomes(@RequestParam String email) {
        return ResponseEntity.ok(fixedIncomeService.getFixedIncomes(email));
    }

    @DeleteMapping("/fixed-income/{id}")
    public ResponseEntity<Map<String, String>> deleteFixedIncome(@PathVariable Long id) {
        fixedIncomeService.deleteFixedIncome(id);
        return ResponseEntity.ok(Map.of("message", "고정 수입이 삭제되었습니다."));
    }

    @PutMapping("/fixed-income/{id}")
    public ResponseEntity<Map<String, String>> updateFixedIncome(
            @PathVariable Long id,
            @RequestBody FixedIncomeRequestDto dto) {
        fixedIncomeService.updateFixedIncome(id, dto);
        return ResponseEntity.ok(Map.of("message", "고정 수입이 수정되었습니다."));
    }

    // --- [ 고정 지출 관련 ] ---
    @PostMapping("/fixed-expense/add")
    public ResponseEntity<Map<String, String>> addFixedExpense(@RequestBody FixedExpenseRequestDto dto) {
        fixedExpenseService.addFixedExpense(dto);
        return ResponseEntity.ok(Map.of("message", "고정 지출이 등록되었습니다."));
    }

    @GetMapping("/fixed-expense")
    public ResponseEntity<List<FixedExpenseResponseDto>> getFixedExpenses(@RequestParam String email) {
        return ResponseEntity.ok(fixedExpenseService.getFixedExpenses(email));
    }

    @DeleteMapping("/fixed-expense/{id}")
    public ResponseEntity<Map<String, String>> deleteFixedExpense(@PathVariable Long id) {
        fixedExpenseService.deleteFixedExpense(id);
        return ResponseEntity.ok(Map.of("message", "고정 지출이 삭제되었습니다."));
    }

    @PutMapping("/fixed-expense/{id}")
    public ResponseEntity<Map<String, String>> updateFixedExpense(
            @PathVariable Long id,
            @RequestBody FixedExpenseRequestDto dto) {
        fixedExpenseService.updateFixedExpense(id, dto);
        return ResponseEntity.ok(Map.of("message", "고정 지출이 수정되었습니다."));
    }
}
