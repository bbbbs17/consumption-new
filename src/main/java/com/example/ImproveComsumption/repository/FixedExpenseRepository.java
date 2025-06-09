package com.example.ImproveComsumption.repository;


import com.example.ImproveComsumption.domain.FixedExpense;
import com.example.ImproveComsumption.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {
    List<FixedExpense> findByMember(Member member);
}
