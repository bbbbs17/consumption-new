package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.model.Consumption;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatternAnalysisService {

    /**
     * 주어진 소비 내역 리스트 중,
     * 같은 시간대(예: 오후) + 같은 품목이 5번 이상 반복되면 "루틴 소비"로 간주
     */
    public List<Consumption> findRoutineConsumptions(List<Consumption> consumptionList) {
        Map<String, List<Consumption>> grouped = new HashMap<>();

        for (Consumption c : consumptionList) {
            String timeSlot = getTimeSlot(c.getLocalDateTime().toLocalTime()); // 새벽, 오전, 오후, 저녁/야간
            String item = normalizeItem(c.getItem());

            String key = timeSlot + "-" + item;
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(c);
        }

        // 5회 이상 반복된 소비만 추출
        return grouped.values().stream()
                .filter(list -> list.size() >= 5)
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    // 시간대를 구분하는 로직
    private String getTimeSlot(LocalTime time) {
        if (time.isBefore(LocalTime.of(6, 0))) return "새벽";
        else if (time.isBefore(LocalTime.of(12, 0))) return "오전";
        else if (time.isBefore(LocalTime.of(18, 0))) return "오후";
        else return "저녁/야간";
    }

    // item을 의미 기반으로 정규화
    private String normalizeItem(String item) {
        String lower = item.toLowerCase();

        if (lower.contains("커피") || lower.contains("아메리카노") || lower.contains("아아")
                || lower.contains("라떼") || lower.contains("카페") || lower.contains("아이스아메리카노")) {
            return "커피";
        }

        if (lower.contains("빵") || lower.contains("케이크") || lower.contains("디저트")) {
            return "디저트";
        }

        return item;
    }
}
