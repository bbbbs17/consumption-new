package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.domain.FixedExpense;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.dto.FixedExpenseRequestDto;
import com.example.ImproveComsumption.dto.FixedExpenseResponseDto;
import com.example.ImproveComsumption.repository.BalanceHistoryRepository;
import com.example.ImproveComsumption.repository.FixedExpenseRepository;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FixedExpenseService {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final MemberRepository memberRepository;
    private final BalanceHistoryRepository balanceHistoryRepository; // ✅ 추가됨

    // 🔵 고정 지출 등록 (DTO 기반)
    public void addFixedExpense(FixedExpenseRequestDto dto) {
        Member member = memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        FixedExpense expense = new FixedExpense();
        expense.setMember(member);
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount()); // ✅ 양수 저장
        expense.setDayOfMonth(dto.getDayOfMonth());

        fixedExpenseRepository.save(expense);
    }

    // 🟢 고정 지출 전체 조회 (히스토리 기준 status 계산)
    @Transactional(readOnly = true)
    public List<FixedExpenseResponseDto> getFixedExpenses(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        LocalDate today = LocalDate.now();

        return fixedExpenseRepository.findByMember(member).stream()
                .map(expense -> {
                    boolean applied = balanceHistoryRepository.existsByMemberAndReasonAndCreatedAtBetween(
                            member,
                            "[고정지출] " + expense.getDescription(),
                            today.withDayOfMonth(1).atStartOfDay(),
                            today.withDayOfMonth(1).plusMonths(1).atStartOfDay()
                    );
                    String status = applied ? "반영완료" : "반영전";

                    return new FixedExpenseResponseDto(
                            expense.getId(),
                            expense.getDescription(),
                            expense.getAmount(),
                            expense.getDayOfMonth(),
                            status
                    );
                })
                .collect(Collectors.toList());
    }

    // 🔴 고정 지출 수정 (DTO 기반)
    public void updateFixedExpense(Long id, FixedExpenseRequestDto dto) {
        FixedExpense expense = fixedExpenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("지출 항목이 존재하지 않습니다."));

        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount()); // ✅ 양수 저장
        expense.setDayOfMonth(dto.getDayOfMonth());
    }

    // 🟠 고정 지출 삭제
    public void deleteFixedExpense(Long id) {
        fixedExpenseRepository.deleteById(id);
    }
}
