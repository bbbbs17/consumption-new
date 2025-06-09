package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.domain.FixedIncome;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.dto.FixedIncomeRequestDto;
import com.example.ImproveComsumption.dto.FixedIncomeResponseDto;
import com.example.ImproveComsumption.repository.BalanceHistoryRepository;
import com.example.ImproveComsumption.repository.FixedIncomeRepository;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FixedIncomeService {

    private final FixedIncomeRepository fixedIncomeRepository;
    private final MemberRepository memberRepository;
    private final BalanceHistoryRepository balanceHistoryRepository; // ✅ 추가

    @Transactional
    public void addFixedIncome(FixedIncomeRequestDto dto) {
        Member member = memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        FixedIncome income = new FixedIncome();
        income.setMember(member);
        income.setAmount(dto.getAmount());
        income.setDescription(dto.getDescription());
        income.setDayOfMonth(dto.getDayOfMonth());

        fixedIncomeRepository.save(income);
    }

    @Transactional(readOnly = true)
    public List<FixedIncomeResponseDto> getFixedIncomes(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        List<FixedIncome> incomes = fixedIncomeRepository.findByMember(member);
        if (incomes == null) {
            return List.of(); // null 방지
        }

        LocalDate today = LocalDate.now();

        return incomes.stream()
                .map(income -> {
                    boolean applied = balanceHistoryRepository.existsByMemberAndReasonAndCreatedAtBetween(
                            member,
                            "[고정수입] " + income.getDescription(),
                            today.withDayOfMonth(1).atStartOfDay(),
                            today.withDayOfMonth(1).plusMonths(1).atStartOfDay()
                    );
                    String status = applied ? "반영완료" : "반영전";

                    return new FixedIncomeResponseDto(
                            income.getId(),
                            income.getAmount(),
                            income.getDescription(),
                            income.getDayOfMonth(),
                            income.getCreatedAt(),
                            status
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateFixedIncome(Long id, FixedIncomeRequestDto dto) {
        FixedIncome income = fixedIncomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 고정 수입이 존재하지 않습니다."));

        // ⛔ member는 수정하지 않음!
        income.setAmount(dto.getAmount());
        income.setDescription(dto.getDescription());
        income.setDayOfMonth(dto.getDayOfMonth());

        // save() 호출도 생략 가능 (영속 상태면 자동 반영됨)
    }


    @Transactional
    public void deleteFixedIncome(Long id) {
        fixedIncomeRepository.deleteById(id);
    }
}
