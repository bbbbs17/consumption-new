package com.example.ImproveComsumption.repository;

import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.domain.PasswordResetToken;
import org.apache.jena.sparql.algebra.Op;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long> {


    Optional<PasswordResetToken> findByMember(Member member);


    Optional<PasswordResetToken> findByMember_Email(String email);

    void deleteByMember(Member member);

}
