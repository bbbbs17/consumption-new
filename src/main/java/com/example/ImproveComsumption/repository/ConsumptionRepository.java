package com.example.ImproveComsumption.repository;

import com.example.ImproveComsumption.model.Consumption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsumptionRepository extends JpaRepository<Consumption, Long> {
    List<Consumption> findByMemberEmail(String email);
}
