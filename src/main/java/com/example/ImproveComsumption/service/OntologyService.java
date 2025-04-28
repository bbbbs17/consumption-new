package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.model.Consumption;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.*;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.ReasonerRegistry;
import org.apache.jena.util.FileManager;
import org.apache.jena.vocabulary.RDF;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Slf4j
@Service
public class OntologyService {

    private static final String ONTOLOGY_PATH = "ontology/consumption.owl";
    private static final String NS = "http://www.semanticweb.org/consumption#";

    /**
     * 소비 정보를 온톨로지에 삽입하고 Reasoner를 통해 추론 실행
     */
    public boolean analyzeConsumption(Consumption c) {
        try {
            // 1. 온톨로지 로딩
            InputStream in = FileManager.get().open(ONTOLOGY_PATH);
            Model base = ModelFactory.createDefaultModel();
            base.read(in, null);

            // 2. Reasoner 설정
            Reasoner reasoner = ReasonerRegistry.getOWLReasoner();
            InfModel infModel = ModelFactory.createInfModel(reasoner, base);

            // 3. 소비 인스턴스 생성
            Resource consumption = infModel.createResource(NS + "consumption_" + c.getId());
            Resource consumptionClass = infModel.getResource(NS + "Consumption");
            infModel.add(consumption, RDF.type, consumptionClass);
            infModel.add(consumption, infModel.getProperty(NS + "hasItem"), c.getItem());
            infModel.add(consumption, infModel.getProperty(NS + "hasTimeSlot"), getTimeSlot(c));
            infModel.add(consumption, infModel.getProperty(NS + "hasPattern"), "루틴");

            // 4. 추론 결과 확인
            Resource habitType = infModel.getResource(NS + "HabitualConsumption");
            boolean isHabitual = infModel.contains(consumption, RDF.type, habitType);
            log.info("소비 {} → 습관 소비인가? {}", c.getItem(), isHabitual);

            return isHabitual;

        } catch (Exception e) {
            log.error("온톨로지 분석 오류", e);
            return false;
        }
    }

    // ✅ 시간대 기준 수정: 새벽/오전/오후/저녁/야간
    private Literal getTimeSlot(Consumption c) {
        int hour = c.getLocalDateTime().getHour();
        String slot;
        if (hour < 6) slot = "새벽";
        else if (hour < 12) slot = "오전";
        else if (hour < 18) slot = "오후";
        else slot = "저녁/야간";
        return ResourceFactory.createPlainLiteral(slot);
    }
}
