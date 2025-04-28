package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.domain.*;
import com.example.ImproveComsumption.dto.balance.BalanceChangeRequestDto;
import com.example.ImproveComsumption.dto.balance.BalanceDto;
import com.example.ImproveComsumption.dto.balance.BalanceHistoryDto;
import com.example.ImproveComsumption.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final MemberRepository memberRepository;
    private final BalanceRepository balanceRepository;
    private final BalanceHistoryRepository balanceHistoryRepository;
    private final FixedIncomeRepository fixedIncomeRepository;

    @Transactional(readOnly = true)
    public BalanceDto getBalanceByEmail(String email) {
        Member member = findMemberByEmail(email);
        Balance balance = balanceRepository.findByMember(member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "잔고 정보 없음"));

        applyFixedIncomesIfNeeded(member, balance); // 고정 수입 자동 반영

        return new BalanceDto(balance.getTotalAmount(), balance.getLastUpdated());
    }

    @Transactional
    public void initializeBalance(String email, int initialAmount) {
        Member member = findMemberByEmail(email);

        balanceRepository.findByMember(member).ifPresent(balanceRepository::delete);
        balanceRepository.flush();

        balanceHistoryRepository.deleteByMember(member);
        balanceHistoryRepository.flush();

        Balance balance = new Balance();
        balance.setMember(member);
        balance.setTotalAmount(initialAmount);
        balanceRepository.save(balance);

        BalanceHistory history = new BalanceHistory();
        history.setMember(member);
        history.setAmountChange(initialAmount);
        history.setReason("초기 잔고 설정 (덮어쓰기 포함)");
        history.setAfterBalance(initialAmount);
        balanceHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<BalanceHistoryDto> getBalanceHistoryByMonth(String email, int year, int month) {
        Member member = findMemberByEmail(email);

        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        List<BalanceHistory> histories = balanceHistoryRepository
                .findByMemberAndCreatedAtBetweenOrderByCreatedAtDesc(member, start, end);

        int currentBalance = balanceRepository.findByMember(member)
                .map(Balance::getTotalAmount)
                .orElse(0);  // balance 없으면 0


        return histories.stream()
                .map(h -> new BalanceHistoryDto(
                        h.getAmountChange(),
                        h.getReason(),
                        h.getCreatedAt(),
                        h.getAfterBalance(),
                        currentBalance
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void changeBalanceManually(BalanceChangeRequestDto dto) {
        Member member = findMemberByEmail(dto.getEmail());
        Balance balance = balanceRepository.findByMember(member)
                .orElseThrow(() -> new IllegalStateException("잔고 정보 없음"));

        int adjustedAmount = balance.getTotalAmount() + dto.getAmountChange();
        balance.setTotalAmount(adjustedAmount);
        balance.setLastUpdated(LocalDateTime.now());

        BalanceHistory history = new BalanceHistory();
        history.setMember(member);
        history.setAmountChange(dto.getAmountChange());
        history.setReason("[수동조정] " + dto.getReason());
        history.setAfterBalance(adjustedAmount);
        balanceHistoryRepository.save(history);
    }

    private Member findMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    // 고정 수입 자동 반영 로직 (수정 완료)
    private void applyFixedIncomesIfNeeded(Member member, Balance balance) {
        LocalDate today = LocalDate.now();
        List<FixedIncome> incomes = fixedIncomeRepository.findByMember(member);

        for (FixedIncome income : incomes) {
            LocalDate createdDate = income.getCreatedAt();
            int incomeDay = income.getDayOfMonth();

            boolean registeredBeforeThisMonth = !createdDate.isAfter(today.withDayOfMonth(1));
            boolean shouldApplyToday = today.getDayOfMonth() == incomeDay;
            boolean shouldApplyBeforeToday = today.getDayOfMonth() > incomeDay;

            if (!registeredBeforeThisMonth) continue;
            if (shouldApplyBeforeToday) continue;
            if (!shouldApplyToday) continue;

            boolean alreadyAdded = balanceHistoryRepository.existsByMemberAndReasonAndCreatedAtBetween(
                    member,
                    "[고정수입] " + income.getDescription(),
                    today.withDayOfMonth(1).atStartOfDay(),
                    today.withDayOfMonth(1).plusMonths(1).atStartOfDay()
            );
            if (alreadyAdded) continue;

            int newBalance = balance.getTotalAmount() + income.getAmount();
            balance.setTotalAmount(newBalance);
            balance.setLastUpdated(LocalDateTime.now());

            BalanceHistory history = new BalanceHistory();
            history.setMember(member);
            history.setAmountChange(income.getAmount());
            history.setReason("[고정수입] " + income.getDescription());
            history.setAfterBalance(newBalance);

            balanceHistoryRepository.save(history);
        }
    }

    @Transactional
    public void resetInitialBalance(String email, int newAmount) {
        Member member = findMemberByEmail(email);
        Balance balance = balanceRepository.findByMember(member)
                .orElseThrow(() -> new IllegalStateException("잔고 정보 없음"));

        balance.setTotalAmount(newAmount);
        balance.setLastUpdated(LocalDateTime.now());
        balanceRepository.save(balance);

        BalanceHistory history = new BalanceHistory();
        history.setMember(member);
        history.setAmountChange(newAmount);
        history.setReason("초기 잔고 재설정");
        history.setAfterBalance(newAmount);

        balanceHistoryRepository.save(history);
    }
}
