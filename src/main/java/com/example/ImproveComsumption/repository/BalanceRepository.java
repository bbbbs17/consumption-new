package com.example.ImproveComsumption.repository;

import com.example.ImproveComsumption.domain.Balance;
import com.example.ImproveComsumption.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, Long> {
    Optional<Balance> findByMember(Member member);
    boolean existsByMember(Member member);
}
