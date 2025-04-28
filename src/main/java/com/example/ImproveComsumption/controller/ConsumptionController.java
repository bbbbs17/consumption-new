package com.example.ImproveComsumption.controller;


import com.example.ImproveComsumption.dto.consumption.ConsumptionAnalysisDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionRequestDto;
import com.example.ImproveComsumption.dto.consumption.ConsumptionUpdateDto;
import com.example.ImproveComsumption.service.ConsumptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequestMapping("api/consumption")
@RequiredArgsConstructor
public class ConsumptionController {

    private final ConsumptionService consumptionService;

    @GetMapping("/check")
    public List<ConsumptionDto> getConsumption(@RequestParam String email){
        return consumptionService.getConsumptionByEmail(email);
    }

    @PostMapping("/post")
    public String registerConsumption(@RequestBody ConsumptionRequestDto requestDto) {
        consumptionService.registerConsumption(requestDto);
        return "소비 내역이 성공적으로 저장되었습니다.";
    }

    @GetMapping("/analysis")
    public List<ConsumptionAnalysisDto> analyze(@RequestParam String email) {
        return consumptionService.analyzeConsumptions(email);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteConsumption(@PathVariable Long id) {
        consumptionService.deleteConsumption(id);
        return "삭제 완료";
    }


    @PutMapping("/update")
    public String updateConsumption(@RequestBody ConsumptionUpdateDto dto) {
        consumptionService.updateConsumption(dto);
        return "수정 완료";
    }




}
