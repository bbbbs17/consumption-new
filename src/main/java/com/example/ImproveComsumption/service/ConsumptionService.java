package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.dto.consumption.ConsumptionDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionRequestDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionAnalysisDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionUpdateDto;
import com.example.ImproveComsumption.model.Consumption;
import com.example.ImproveComsumption.repository.ConsumptionRepository;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumptionService {

    private final ConsumptionRepository consumptionRepository;
    private final MemberRepository memberRepository;
    private final PatternAnalysisService patternAnalysisService; // ✅ 실제 루틴 판단 주체
    private final OntologyService ontologyService; // (선택적으로 유지 가능)

    /**
     * 소비 내역 조회
     */
    public List<ConsumptionDto> getConsumptionByEmail(String email){
        List<Consumption> consumptionList = consumptionRepository.findByMemberEmail(email);
        return consumptionList.stream().map(c -> {
            ConsumptionDto dto = new ConsumptionDto();
            dto.setId(c.getId());
            dto.setLocalDateTime(c.getLocalDateTime());
            dto.setAmount(c.getAmount());
            dto.setItem(c.getItem());
            dto.setPlace(c.getPlace());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 소비 등록
     */
    public void registerConsumption(ConsumptionRequestDto requestDto) {
        Member member = memberRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Consumption consumption = new Consumption();
        consumption.setMember(member);
        consumption.setAmount(requestDto.getAmount());
        consumption.setItem(requestDto.getItem());
        consumption.setPlace(requestDto.getPlace());
        consumption.setLocalDateTime(requestDto.getLocalDateTime());

        consumptionRepository.save(consumption);
    }

    /**
     * 소비 분석: PatternAnalysis 기반으로 습관 소비 판단
     */
    public List<ConsumptionAnalysisDto> analyzeConsumptions(String email) {
        List<Consumption> all = consumptionRepository.findByMemberEmail(email);

        // ✅ 습관 소비 판단 (5회 이상 반복된 시간대-품목)
        List<Consumption> habituals = patternAnalysisService.findRoutineConsumptions(all);
        Set<Long> habitualIds = habituals.stream().map(Consumption::getId).collect(Collectors.toSet());

        return all.stream().map(c -> {
            ConsumptionAnalysisDto dto = new ConsumptionAnalysisDto();
            dto.setDateTime(c.getLocalDateTime());
            dto.setItem(c.getItem());
            dto.setPlace(c.getPlace());
            dto.setAmount(c.getAmount());
            dto.setHabitual(habitualIds.contains(c.getId())); // ✅ 여기서 true/false 반영
            return dto;
        }).collect(Collectors.toList());
    }

    public void deleteConsumption(Long id) {
        Consumption consumption = consumptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 소비 내역이 존재하지 않습니다."));
        consumptionRepository.delete(consumption);
    }

    public void updateConsumption(ConsumptionUpdateDto dto) {
        Consumption consumption = consumptionRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 소비 내역이 없습니다."));

        consumption.setItem(dto.getItem());
        consumption.setPlace(dto.getPlace());
        consumption.setAmount(dto.getAmount());
        consumption.setLocalDateTime(dto.getLocalDateTime());

        consumptionRepository.save(consumption);  // 변경사항 저장
    }


}
