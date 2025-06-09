package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.domain.ConsumptionType;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.domain.Consumption;
import com.example.ImproveComsumption.dto.consumption.ConsumptionDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionRequestDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionAnalysisDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionUpdateDto;
import com.example.ImproveComsumption.repository.ConsumptionRepository;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumptionService {

    private final ConsumptionRepository consumptionRepository;
    private final MemberRepository memberRepository;
    private final BalanceService balanceService;
    private final PatternAnalysisService patternAnalysisService;
    private final OntologyService ontologyService;

    /**
     * 소비 내역 조회
     */
    @Transactional(readOnly = true)
    public List<ConsumptionDto> getConsumptionByEmail(String email) {
        List<Consumption> consumptionList = consumptionRepository.findByMemberEmail(email);
        return consumptionList.stream().map(c -> {
            ConsumptionDto dto = new ConsumptionDto();
            dto.setId(c.getId());
            dto.setLocalDateTime(c.getLocalDateTime());
            dto.setAmount(c.getAmount());
            dto.setItem(c.getItem());
            dto.setAddress(c.getAddress());
            dto.setLatitude(c.getLatitude());
            dto.setLongitude(c.getLongitude());
            dto.setPlaceName(c.getPlaceName());
            dto.setType(c.getType());  // ✅ type 포함
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 소비/수입 등록
     */
    @Transactional
    public void registerConsumption(ConsumptionRequestDto requestDto) {
        Member member = memberRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // ✅ 유형에 따라 잔고 조정
        if (requestDto.getType() == ConsumptionType.EXPENSE) {
            balanceService.applyConsumption(member, requestDto.getAmount(), requestDto.getItem());
        } else if (requestDto.getType() == ConsumptionType.INCOME) {
            balanceService.applyIncome(member, requestDto.getAmount(), requestDto.getItem());
        } else {
            throw new IllegalArgumentException("소비 유형이 잘못되었습니다.");
        }

        Consumption consumption = new Consumption();
        consumption.setMember(member);
        consumption.setAmount(requestDto.getAmount());
        consumption.setItem(requestDto.getItem());
        consumption.setAddress(requestDto.getAddress());
        consumption.setLatitude(requestDto.getLatitude());
        consumption.setLongitude(requestDto.getLongitude());
        consumption.setPlaceName(requestDto.getPlaceName());
        consumption.setLocalDateTime(requestDto.getLocalDateTime());
        consumption.setType(requestDto.getType()); // ✅ 저장

        consumptionRepository.save(consumption);
    }

    /**
     * 소비 분석
     */
    @Transactional(readOnly = true)
    public List<ConsumptionAnalysisDto> analyzeConsumptions(String email) {
        List<Consumption> all = consumptionRepository.findByMemberEmail(email);

        List<Consumption> habituals = patternAnalysisService.findRoutineConsumptions(all);
        Set<Long> habitualIds = habituals.stream().map(Consumption::getId).collect(Collectors.toSet());

        return all.stream().map(c -> {
            ConsumptionAnalysisDto dto = new ConsumptionAnalysisDto();
            dto.setDateTime(c.getLocalDateTime());
            dto.setItem(c.getItem());
            dto.setAddress(c.getAddress());
            dto.setLatitude(c.getLatitude());
            dto.setLongitude(c.getLongitude());
            dto.setPlaceName(c.getPlaceName());
            dto.setAmount(c.getAmount());
            dto.setHabitual(habitualIds.contains(c.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 소비/수입 삭제 + 잔고 복구
     */
    @Transactional
    public void deleteConsumption(Long id) {
        Consumption consumption = consumptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 소비 내역이 존재하지 않습니다."));

        Member member = consumption.getMember();

        // ✅ type에 따라 잔고 복구
        if (consumption.getType() == ConsumptionType.EXPENSE) {
            balanceService.recoverConsumption(member, consumption.getAmount(), consumption.getItem(), consumption.getType());

        } else if (consumption.getType() == ConsumptionType.INCOME) {
            balanceService.recoverConsumption(member, consumption.getAmount(), consumption.getItem(), consumption.getType());

        }

        consumptionRepository.delete(consumption);
    }

    /**
     * 소비 수정
     */
    @Transactional
    public void updateConsumption(ConsumptionUpdateDto dto) {
        Consumption consumption = consumptionRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 소비 내역이 없습니다."));

        consumption.setItem(dto.getItem());
        consumption.setAmount(dto.getAmount());
        consumption.setAddress(dto.getAddress());
        consumption.setLatitude(dto.getLatitude());
        consumption.setLongitude(dto.getLongitude());
        consumption.setPlaceName(dto.getPlaceName());
        consumption.setLocalDateTime(dto.getLocalDateTime());
        // ❗ type은 수정하지 않음 (고정된 구조로 유지)

        consumptionRepository.save(consumption);
    }
}
