package com.example.ImproveComsumption.controller;


import com.example.ImproveComsumption.dto.consumption.ConsumptionAnalysisDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionRequestDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionUpdateDto;
import com.example.ImproveComsumption.service.ConsumptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequestMapping("api/consumption")
@RequiredArgsConstructor
public class ConsumptionController {

    private final ConsumptionService consumptionService;

    @GetMapping("/check")
    public ResponseEntity<List<ConsumptionDto>> getConsumption(@RequestParam String email){
        return ResponseEntity.ok(consumptionService.getConsumptionByEmail(email));
    }

    @PostMapping("/post")
    public ResponseEntity<Map<String, String>> registerConsumption(@RequestBody ConsumptionRequestDto requestDto) {
        consumptionService.registerConsumption(requestDto);
        return ResponseEntity.ok(Map.of("message", "소비 내역이 성공적으로 저장되었습니다."));
    }

    @GetMapping("/analysis")
    public ResponseEntity<List<ConsumptionAnalysisDto>> analyze(@RequestParam String email) {
        return ResponseEntity.ok(consumptionService.analyzeConsumptions(email));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteConsumption(@PathVariable Long id) {
        consumptionService.deleteConsumption(id);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updateConsumption(@RequestBody ConsumptionUpdateDto dto) {
        consumptionService.updateConsumption(dto);
        return ResponseEntity.ok(Map.of("message", "수정 완료"));
    }
}