package com.example.ImproveComsumption.repository;

import com.example.ImproveComsumption.domain.FixedIncome;
import com.example.ImproveComsumption.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FixedIncomeRepository extends JpaRepository<FixedIncome, Long> {

    List<FixedIncome> findByMember(Member member);
}
