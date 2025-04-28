package com.example.ImproveComsumption.repository;

import com.example.ImproveComsumption.domain.BalanceHistory;
import com.example.ImproveComsumption.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface BalanceHistoryRepository extends JpaRepository<BalanceHistory, Long> {

    // 🔍 월별 이력 조회
    List<BalanceHistory> findByMemberAndCreatedAtBetweenOrderByCreatedAtDesc(Member member, LocalDateTime start, LocalDateTime end);

    // 🧹 회원의 전체 이력 삭제
    @Transactional
    void deleteByMember(Member member);

    // ✅ 중복 고정 수입 반영 방지를 위한 조건 조회
    boolean existsByMemberAndReasonAndCreatedAtBetween(
            Member member,
            String reason,
            LocalDateTime start,
            LocalDateTime end
    );
}
